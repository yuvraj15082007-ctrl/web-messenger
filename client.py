import socket
import threading
from datetime import datetime

SERVER_IP = "10.130.224.55"  # Replace with server LAN IP
PORT = 5001

class Colors:
    RESET  = '\033[0m'
    GREEN  = '\033[92m'
    CYAN   = '\033[96m'
    RED    = '\033[91m'
    YELLOW = '\033[93m'

def timestamp():
    return datetime.now().strftime("%H:%M:%S")

def recv_loop(sock):
    try:
        while True:
            data = sock.recv(1024)
            if not data:
                print(f"{Colors.RED}[{timestamp()}] Server disconnected{Colors.RESET}")
                break
            print(f"{Colors.CYAN}{data.decode().strip()}{Colors.RESET}")
    except Exception as e:
        print(f"{Colors.RED}[{timestamp()}] Receive error: {e}{Colors.RESET}")
    finally:
        try: sock.close()
        except: pass

def main():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.connect((SERVER_IP, PORT))
    except Exception as e:
        print(f"{Colors.RED}[client] Connection failed: {e}{Colors.RESET}")
        return

    t = threading.Thread(target=recv_loop, args=(sock,), daemon=True)
    t.start()

    try:
        # Receive nickname prompt
        prompt = sock.recv(1024).decode()
        nickname = input(prompt).strip()
        sock.sendall((nickname+'\n').encode())
        print(f"{Colors.YELLOW}[{timestamp()}] Connected as {nickname}{Colors.RESET}")
        print(f"{Colors.YELLOW}Type 'exit' to leave chat.{Colors.RESET}")

        while True:
            msg = input()
            if not msg:
                continue
            if msg.lower() in ('exit', 'quit'):
                break
            sock.sendall((msg+'\n').encode())
    except KeyboardInterrupt:
        pass
    finally:
        try: sock.close()
        except: pass
        print(f"{Colors.RED}[{timestamp()}] Disconnected{Colors.RESET}")

if __name__ == "__main__":
    main()
