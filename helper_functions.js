let moveInterval;

function getItemId(itemName){
	for (let idx in item){
		if (item[idx].name == itemName){
			return item[idx].id;
		}
	}
}

function getItemFromList(itemId){
	return item[itemId];
}

function getItemInRoom(itemId){
	return getRoom().items[itemId];
}

function getRoomId(roomName){
	for (let i in room){
		if (room[i].name == roomName){
			return room[i].id;
		}
	}
}

function spawnItem(itemName, xIn, yIn, roomName){
	let itmId = getItemId(itemName);
	let roomId;

	if (roomName == undefined){
		roomId = getRoom().id;
	}
	else{
		roomId = getRoomId(roomName);
	}

	room[roomId].items.push({
		id : itmId,
		x : xIn,
		y : yIn
	});
}

function removeItemFromRoom(itemName, roomName, x, y){
	let itm = getItemFromList(getItemId(itemName));
	let thisRoom;

	if (roomName == undefined || roomName == null){
		thisRoom = getRoom();
	}
	else{
		thisRoom = room[getRoomId(roomName)];
	}

	for (let i = 0; i < thisRoom.items.length; i++){
		let roomItm = thisRoom.items[i];

		if (roomItm.id == itm.id){
			let hasParam = !(x == undefined || y == undefined);

			if ((hasParam && (roomItm.x == x && roomItm.y == y)) || (!hasParam)){
				thisRoom.items.splice(i, 1);
				return true;
			}
		}
	}

	return false;
}

function removeAllItemsFromRoom(itemName, roomName){
	let itmCount = 0;

	while (removeItemFromRoom(itemName, roomName)){
		itmCount++;
	}

	return itmCount;
}

function removeAllItemsFromWorld(itemName){
	let itmId = getItemId(itemName);
	let itmCount = 0;

	for (let i in room){
		let thisRoom = room[i];

		for (let itm = 0; itm < thisRoom.items.length; itm++){
			if (thisRoom.items[itm].id == itmId){
				thisRoom.items.splice(itm, 1);
				itmCount++;
				itm = -1;
			}
		}
	}

	return itmCount;
}

function swapItem(oldItemName, newItemName, roomName){
	let oldItem = getItemInRoom(getItemId(oldItemName));
	let itemFound = removeItemFromRoom(oldItemName, roomName);
	spawnItem(newItemName, oldItem.x, oldItem.y, roomName);
	return (itemFound == 1);
}

function moveItem(itemName, newX, newY, msStep){
	let itmId = getItemId(itemName);
	let ms;

	if (msStep){
		ms = msStep;
	}
	else{
		ms = 200;
	}

	moveInterval = setInterval(function(){_moveItem(itmId, newX, newY)}, ms);
}

function _moveItem(itmId, newX, newY){
	let roomItem = getItemInRoom(itmId);
	let dirList = [
		[1, 0],
		[0, 1],
		[-1, 0],
		[0, -1]
	];
	let nextDir = dirList[0];
	let nextDist = getDistanceNoSqrt(roomItem.x, roomItem.y, dirList[0][0], dirList[0][1]);

	for (let i = 1; i < dirList.length; i++){
		let checkPos = [roomItem.x + dirList[i][0], roomItem.y + dirList[i][1]];
		let checkDist = getDistanceNoSqrt(checkPos[0], checkPos[1], newX, newY);

		if (checkDist < nextDist){
			nextDir = dirList[i];
			nextDist = checkDist;
		}
	}

	if (roomItem.x == newX && roomItem.y == newY){
		clearInterval(moveInterval);
	}
	else{
		roomItem.x += nextDir[0];
		roomItem.y += nextDir[1];
	}
}

function getDistanceNoSqrt(x1, y1, x2, y2){
	return (Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}