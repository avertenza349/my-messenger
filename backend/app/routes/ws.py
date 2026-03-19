from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from jose import jwt, JWTError

from app.config import SECRET_KEY, ALGORITHM
from app.websocket_manager import manager

router = APIRouter(tags=["websocket"])


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=1008)
        return

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            await websocket.close(code=1008)
            return

        user_id = int(user_id)
    except JWTError:
        await websocket.close(code=1008)
        return

    await manager.connect(user_id, websocket)

    try:
        while True:
            data = await websocket.receive_text()
            print(f"WS MESSAGE FROM USER {user_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)