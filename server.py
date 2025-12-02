# server.py
import socket
import threading
import json
from datetime import datetime

HOST = "0.0.0.0"
PORT = 5001

clients = {}  # nickname -> (conn, addr)
clients_lock = threading.Lock()

def timestamp():
    return datetime.now().strftime("%H:%M:%S")

def send_line(conn, obj):
    data = (json.dumps(obj) + "\n").encode()
    conn.sendall(data)

def broadcast_line(obj, exclude_conn=None):
    data = (json.dumps(obj) + "\n").encode()
    with clients_lock:
        for nick, (c, addr) in clients.items():
            if c is exclude_conn:
                continue
            try:
                c.sendall(data)
            except:
                pass

def relay_stream(src_conn, dst_conn, total_bytes):
    """Read exactly total_bytes from src_conn and forward to dst_conn in chunks."""
    remaining = total_bytes
    try:
        while remaining > 0:
            chunk_size = 65536 if remaining >= 65536 else remaining
            chunk = src_conn.recv(chunk_size)
            if not chunk:
                raise ConnectionError("Source disconnected during file transfer")
            dst_conn.sendall(chunk)
            remaining -= len(chunk)
    except Exception as e:
        raise

def handle_client(conn, addr):
    try:
        # Ask nickname
        send_line(conn, {"type":"system","text":"Enter your nickname:"})
        # read header line
        buffer = b""
        # read a single JSON line for nickname
        while b"\n" not in buffer:
            chunk = conn.recv(4096)
            if not chunk:
                conn.close()
                return
            buffer += chunk
        line, buffer = buffer.split(b"\n",1)
        try:
            nickname = line.decode().strip()
        except:
            nickname = str(addr)
        if not nickname:
            nickname = str(addr)

        with clients_lock:
            if nickname in clients:
                # make unique
                base = nickname
                i = 1
                while f"{base}_{i}" in clients:
                    i += 1
                nickname = f"{base}_{i}"
            clients[nickname] = (conn, addr)

        print(f"[{timestamp()}] [+] {nickname} connected from {addr}")
        broadcast_line({"type":"system","text":f"[{timestamp()}] {nickname} joined the chat."}, exclude_conn=conn)
        send_line(conn, {"type":"system","text":f"Welcome {nickname}!"})

        # Main receive loop (handle JSON headers and file streams)
        buffer = buffer  # may contain leftover
        while True:
            # ensure we have a full JSON header line
            while b"\n" not in buffer:
                chunk = conn.recv(4096)
                if not chunk:
                    raise ConnectionError("client disconnected")
                buffer += chunk
            line, buffer = buffer.split(b"\n", 1)
            try:
                header = json.loads(line.decode())
            except Exception as e:
                # ignore bad header
                continue

            htype = header.get("type")
            if htype == "msg":
                to = header.get("to")
                text = header.get("text", "")
                sender = header.get("from")
                if to and to != "all":
                    # private
                    with clients_lock:
                        entry = clients.get(to)
                    if entry:
                        dst_conn, _ = entry
                        send_line(dst_conn, {"type":"msg","from":sender,"to":to,"text":text})
                    else:
                        send_line(conn, {"type":"system","text":f"User {to} not found."})
                else:
                    # broadcast
                    broadcast_line({"type":"msg","from":sender,"to":"all","text":text}, exclude_conn=None)

            elif htype == "file_start":
                # header must contain: from, to, filename, size
                sender = header.get("from")
                to = header.get("to")
                filename = header.get("filename")
                size = int(header.get("size", 0))
                if size <= 0:
                    send_line(conn, {"type":"system","text":"Invalid file size."})
                    continue

                # decide destination
                if to and to != "all":
                    with clients_lock:
                        entry = clients.get(to)
                    if not entry:
                        send_line(conn, {"type":"system","text":f"User {to} not found. File aborted."})
                        # consume and discard the bytes to keep stream in sync
                        remaining = size
                        while remaining > 0:
                            chunk = conn.recv(65536)
                            if not chunk:
                                break
                            remaining -= len(chunk)
                        continue
                    dst_conn, _ = entry
                    # forward header to recipient
                    send_line(dst_conn, {"type":"file_start","from":sender,"filename":filename,"size":size})
                    # relay bytes
                    try:
                        relay_stream(conn, dst_conn, size)
                        send_line(dst_conn, {"type":"file_end","from":sender,"filename":filename})
                        send_line(conn, {"type":"system","text":f"File {filename} sent to {to}."})
                        print(f"[{timestamp()}] File {filename} ({size} bytes) relayed {sender} -> {to}")
                    except Exception as e:
                        send_line(conn, {"type":"system","text":f"File transfer failed: {e}"})
                        try:
                            send_line(dst_conn, {"type":"system","text":f"File transfer interrupted from {sender}."})
                        except:
                            pass
                else:
                    # broadcast file to all (rare). We'll forward header then stream to each client sequentially.
                    with clients_lock:
                        dests = [(c, n) for n,(c,_) in clients.items() if n != sender]
                    if not dests:
                        # consume bytes to keep in sync
                        remaining = size
                        while remaining > 0:
                            chunk = conn.recv(65536)
                            if not chunk:
                                break
                            remaining -= len(chunk)
                        send_line(conn, {"type":"system","text":"No recipients for broadcast file."})
                        continue
                    # For each dest we must stream the file from the source; easiest approach: buffer chunks from source and send to all dests as we read.
                    remaining = size
                    for c, _ in dests:
                        send_line(c, {"type":"file_start","from":sender,"filename":filename,"size":size})
                    try:
                        while remaining > 0:
                            chunk = conn.recv(65536 if remaining>=65536 else remaining)
                            if not chunk:
                                raise ConnectionError("source disconnected")
                            for c,_ in dests:
                                try:
                                    c.sendall(chunk)
                                except:
                                    pass
                            remaining -= len(chunk)
                        for c,_ in dests:
                            send_line(c, {"type":"file_end","from":sender,"filename":filename})
                        send_line(conn, {"type":"system","text":"Broadcast file sent."})
                    except Exception as e:
                        send_line(conn, {"type":"system","text":f"Broadcast failed: {e}"})

            else:
                # unknown header
                continue

    except ConnectionError:
        pass
    except Exception as e:
        print(f"[{timestamp()}] Error with client {addr}: {e}")
    finally:
        # cleanup
        with clients_lock:
            # remove this conn
            for n,(c,a) in list(clients.items()):
                if c is conn:
                    nickname = n
                    del clients[n]
                    break
            else:
                nickname = str(addr)
        print(f"[{timestamp()}] [-] {nickname} disconnected")
        broadcast_line({"type":"system","text":f"[{timestamp()}] {nickname} disconnected"})

def main():
    print(f"[{timestamp()}] Server starting on {HOST}:{PORT}")
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind((HOST, PORT))
        s.listen(50)
        try:
            while True:
                conn, addr = s.accept()
                t = threading.Thread(target=handle_client, args=(conn, addr), daemon=True)
                t.start()
        except KeyboardInterrupt:
            print("\nServer shutting down...")

if __name__ == "__main__":
    main()