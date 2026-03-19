from collections import defaultdict
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.user_connections = defaultdict(list)

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.user_connections[user_id].append(websocket)
        print(f"WS CONNECT user_id={user_id}, total={len(self.user_connections[user_id])}")

    def disconnect(self, user_id: int, websocket: WebSocket):
        if user_id in self.user_connections and websocket in self.user_connections[user_id]:
            self.user_connections[user_id].remove(websocket)

            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
                print(f"WS DISCONNECT user_id={user_id}, total=0")
            else:
                print(f"WS DISCONNECT user_id={user_id}, total={len(self.user_connections[user_id])}")

    async def send_to_user(self, user_id: int, message: dict):
        if user_id not in self.user_connections:
            print(f"WS SEND user_id={user_id}, no active connections")
            return

        disconnected = []

        for connection in self.user_connections[user_id]:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)

        for connection in disconnected:
            self.disconnect(user_id, connection)


manager = ConnectionManager()