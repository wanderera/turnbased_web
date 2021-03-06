const tile_type_enum = {
    WALKABLE:0,
    BLOCKING:1,
    SEETHOUGH:2,
    PASSING_CH:3,
    NONPASSING_CH:4
}

class GridNode{
    constructor(i, j, type=tile_type_enum.WALKABLE, moveCost=1){
	
	this.i = i;
	this.j = j;
	
	this.type = type;
	this.moveCost = moveCost;


	// path finding attributes
	this.gCost = 0;
	this.hCost = 0;
	this.fCost = 0;
	this.neighborNodes = [];
	this.parentNode = null;
    }

    calculateFCost() {this.fCost = this.gCost + this.hCost;}
    
    setType(type){
	this.type = type;
	if (type == tile_type_enum.WALKABLE){
	    this.moveCost = 1;
	}
    }
};


class SystemGrid{
    constructor(grid_dim, grid_size){
	this.dim = grid_dim;
	this.size = grid_size;
	this.nodes = [];
	for (let i = 0; i< this.dim[0]; i++){
	    this.nodes.push([]);
	    for (let j = 0 ; j< this.dim[1]; j++){
		this.nodes[i].push(new GridNode(i,j));
	    }
	}

	// populate neighbor nodes list
	this.calculateNeighborNodes();
	//this.printNeighborNodes();
	
	// pathing findong sets
	this.openSet = new Set([]); // nodes to be searched
	this.closedSet = new Set([]); // nodes already searched

    }

    setGridType(i ,j, type){
	this.nodes[i][j].setType(type);
    }

    paintGridsByList(lists, types){
	for (let i=0; i<lists.length; i++){
	    let list = lists[i];
	    let type = types[i];
	    for (let h of list){
		let currentIJ = h.calculateIJ();
		this.setGridType(currentIJ[0], currentIJ[1], type);
		console.log ("set",currentIJ,"to",
			     this.nodes[currentIJ[0]][currentIJ[1]].type);
	    }
	}   
    }



    findPath(startI, startJ, endI, endJ){

	this.openSet.clear();
	this.closedSet.clear();
	
	if (startI < 0 || startJ < 0 ||
	    startI >= this.dim[0] || startJ >= this.dim[1] ||
	    endI < 0 || endJ < 0 ||
	    endI >= this.dim[0] || endJ >= this.dim[1])
	{
	    console.log("invalid path finding input" +
			" ["+ startI +", ",+startJ+"] to" +
		        " ["+endI, +", "+endJ+"]");
	    return null;
	}

	if (this.nodes[endI][endJ].type !=  tile_type_enum.WALKABLE)
	{
	    console.log("invalid path finding destination" +
		        " ["+endI +", "+endJ+"]");
	    return null;
	}

	// set set node in grids
	// init openset and
	// set parent node's parent to -1
	let startNode = this.nodes[startI][startJ];
	let endNode = this.nodes[endI][endJ];
	this.openSet.add(startNode);

	
	for (let i = 0; i< this.dim[0]; i++){
	    for (let j = 0 ; j< this.dim[1]; j++){
		let currentNode = this.nodes[i][j];
		currentNode.gCost = Number.MAX_VALUE;
		currentNode.calculateFCost();
		currentNode.parentNode = null;
	    }
	}
	
	console.log("pathfinding sets initialization complete");
	
	this.nodes[startI][startJ].gCost = 0;
	this.nodes[startI][startI].hCost = this.calculateDistanceCost(startNode, endNode);
	this.nodes[startI][startJ].calculateFCost();

	
	while (this.openSet.size > 0){
	    let currentNode = this.getLowestFCostNode(this.openSet);
	    if (currentNode == this.nodes[endI][endJ])
	    {
		// reach final node
		console.log("found path ["+startI+", "+startJ+"] "
			    +"to ["+endI+", "+endJ+"]");
		return this.calculatePath(endI, endJ);
	    }
	    
	    this.openSet.delete(currentNode);
	    this.closedSet.add(currentNode);

	    for (let neighbor of currentNode.neighborNodes){
		if (this.closedSet.has(neighbor)) continue;
		if (neighbor.type == tile_type_enum.NONPASSING_CH) continue;
		
		let tmpGCost = currentNode.gCost + neighbor.moveCost;
		
		if (tmpGCost < neighbor.gCost){
		    // found a shorter path
		    neighbor.parentNode = currentNode;
		    neighbor.gCost = tmpGCost;
		    neighbor.hCost = this.calculateDistanceCost(neighbor, endNode);
		    if ( !this.openSet.has(neighbor))
			this.openSet.add(neighbor);
		}

	    }
	}
	
	// out of nodes on the open list
	return null;
	
    }

    getUITiles(startI, startJ, movePoints, actRange){

	let moveTiles = new Set();
	let actTiles = new Set();
	
	this.openSet.clear();
	this.closedSet.clear();
	
	if (startI < 0 || startJ < 0 ||
	    startI >= this.dim[0] || startJ >= this.dim[1])
	{
	    console.log("invalid UI tile finding input" +
			" ["+ startI +", ",+startJ+"]");
	    return;
	}

	// set set node in grids
	// init openset and
	// set parent node's parent to -1
	let startNode = this.nodes[startI][startJ];
	this.openSet.add(startNode);

	
	for (let i = 0; i< this.dim[0]; i++){
	    for (let j = 0 ; j< this.dim[1]; j++){
		let currentNode = this.nodes[i][j];
		currentNode.gCost = Number.MAX_VALUE;
		currentNode.hCost = 0; // no use
		currentNode.calculateFCost();// no use
		currentNode.parentNode = null;
	    }
	}
	
	console.log("UI tiles finding sets initialization complete");
	
	this.nodes[startI][startJ].gCost = 0;
	moveTiles.add(this.nodes[startI][startJ]);
	this.addNodeToSetAtRange(actRange, this.nodes[startI][startJ], actTiles);
	
	while (this.openSet.size > 0){
	    let currentNode = this.getLowestGCostNode(this.openSet);
	    
	    this.openSet.delete(currentNode);
	    this.closedSet.add(currentNode);

	    for (let neighbor of currentNode.neighborNodes){
		if (this.closedSet.has(neighbor)) continue;
		// if neighbor is NONPASSING_CH
		// skip as if BLOCKING
		if (neighbor.type == tile_type_enum.NONPASSING_CH) continue;
		
		let tmpGCost = currentNode.gCost + neighbor.moveCost;

		
		if (tmpGCost <= movePoints){
		    moveTiles.add(neighbor);
		    // if move tile not WALKABLE don't add action tiles
		    // tile type doesn't matter within action tiles
		    if (neighbor.type == tile_type_enum.WALKABLE)
			this.addNodeToSetAtRange(actRange, neighbor, actTiles);
		    //console.log("add: "+neighbor.i+" "+neighbor.j+" cost="+tmpGCost);
		}else continue; // this neighbor node out of range  

		// if within range update gcost
		// and add to open set for next search
		if (tmpGCost < neighbor.gCost){
		    // found a shorter path
		    neighbor.parentNode = currentNode;
		    neighbor.gCost = tmpGCost;
		    if ( !this.openSet.has(neighbor))
			this.openSet.add(neighbor);
		}

	    }
	}

	console.log("finish UI tiles calculation on ["+startI+", "+startJ+"]"
		    +" moveTiles.size = "+moveTiles.size
		    +" actTiles.size = "+actTiles.size)
	
	// out of nodes on the open list
	return [moveTiles, actTiles];
	
    }


    
    draw(buffer, offset_x=0, offset_y=0){
	buffer.lineWidth = 1;
	buffer.strokeStyle = "white";
	
	
	for (let i = 0; i< this.dim[0]; i++){
	    for (let j = 0 ; j< this.dim[1]; j++){
		buffer.beginPath();
		buffer.moveTo((i+1)*this.size + offset_x,
			      (j)*this.size + offset_y);
		buffer.lineTo(i*this.size + offset_x,
			      j*this.size + offset_y);
		buffer.lineTo((i)*this.size + offset_x,
			      (j+1)*this.size + offset_y);
		buffer.stroke();

		
		buffer.font = buffer.font.replace(/\d+px/, "12px");
		buffer.fillStyle = 'white';
		buffer.fillText(this.nodes[i][j].moveCost==1?1:"inf1",
				(i+0.3)*this.size + offset_x,
				(j+0.7)*this.size + offset_y)

		
		buffer.fillStyle = 'blue';
		buffer.fillText(this.nodes[i][j].type,
				(i+0.5)*this.size + offset_x,
				(j+0.9)*this.size + offset_y)
	    }
	}   

    }

    drawPath(buffer, path, offset_x=0, offset_y=0){
	if (path == null) return;
	buffer.lineWidth = 1;
	buffer.strokeStyle = "white";
	
	for (let i = 0; i< path.length-1; i++){
	    let currentNode = path[i];
	    let nextNode = path[i+1];
	    
	    buffer.beginPath();
	    buffer.moveTo((currentNode.i+0.4)*this.size + offset_x,
			  (currentNode.j+0.4)*this.size + offset_y);
	    buffer.lineTo((nextNode.i+0.5)*this.size + offset_x,
			  (nextNode.j+0.5)*this.size + offset_y);
	    buffer.stroke();
	}

    }

    drawUITiles(buffer, UITiles, offset_x=0, offset_y=0){
	if (UITiles == null) return;
	
	let moveSet = UITiles[0];
	let actSet = UITiles[1];
	
	buffer.fillStyle = "rgba(0,0,255,0.5)";
	
	for (let node of moveSet){
	    buffer.beginPath();
	    buffer.fillRect(node.i * this.size, node.j*this.size, this.size, this.size);
	    buffer.stroke();
	}
	
	buffer.fillStyle = "rgba(255,0,0,0.5)";
	for (let node of actSet){
	    if (moveSet.has(node)) continue;
	    buffer.beginPath();
	    buffer.fillRect(node.i * this.size, node.j*this.size, this.size, this.size);
	    buffer.stroke();
	}
    }

    drawAfterMoveActionTiles(buffer, tiles, offset_x=0, offset_y=0){
	if (tiles == null) return;

	let actSet = tiles;
	
	for (let node of actSet){
	    buffer.beginPath();
	    buffer.fillStyle = "rgba(255,0,0,0.5)";
	    buffer.fillRect(node.i * this.size, node.j*this.size, this.size, this.size);
	    buffer.stroke();
	}
    }
    
    // helper functions
    xToI(in_x){
	return Math.floor(in_x / systemGrid.size);
    }

    yToJ(in_y){
	return Math.floor(in_y / systemGrid.size);
    }

    xyToIJ(in_xy){
	return [Math.floor(in_xy[0] / systemGrid.size),
		Math.floor(in_xy[1] / systemGrid.size)];
    }

    posIsSameInIJ(e_x, e_y, c_x, c_y){
	return ((this.xToI(e_x) == this.xToI(c_x)) &&
		(this.yToJ(e_y) == this.yToJ(c_y)) );
    }
    
    indexWithinBound(i,j){
	return (i >= 0) && (i< this.dim[0]) && (j >= 0) && (j< this.dim[1]);  
    }
    
    calculateNeighborNodes(){
	for (let i = 0; i< this.dim[0]; i++){
	    for (let j = 0 ; j< this.dim[1]; j++){
		this.nodes[i][j].neighborNodes.splice(0, this.nodes[i][j].neighborNodes.length);
	    }
	}
	
	for (let i = 0; i< this.dim[0]; i++){
	    for (let j = 0 ; j< this.dim[1]; j++){
		let currentNode = this.nodes[i][j];
		let neighbor_indices = [[i-1, j],
					[i+1, j],
					[i, j-1],
					[i, j+1]
				       ];
		let neighbor_exist = [currentNode.i - 1 >= 0,
				      currentNode.i + 1 < this.dim[0],
				      currentNode.j - 1 >= 0,
				      currentNode.j + 1 < this.dim[1]
				     ];
		for (let k=0; k<neighbor_indices.length; k++){
		    if (neighbor_exist[k]){
			let neighbor = this.nodes[neighbor_indices[k][0]][neighbor_indices[k][1]];
			if (neighbor.type == tile_type_enum.WALKABLE)
			    currentNode.neighborNodes.push(neighbor);
		    }
		}
		
	    }
	}

    }

    addNodeToSetAtRange(actDists, currentNode, actTiles){
	for (let k=0; k<actDists.length; k++){
	    let actDist = actDists[k];
	    for (let d=0; d<actDist; d++){
		// four quadrants
		let indices = [[d, actDist - d],
			       [actDist - d, -d],
			       [-d, d - actDist],
			       [d - actDist, d]];
		for (let p=0; p<4; p++){
		    let index = [indices[p][0] + currentNode.i,
				 indices[p][1] + currentNode.j];
		    
		    //console.log(indices[p]);
		    if ( this.indexWithinBound(index[0], index[1])){
			//if (this.nodes[index[0]][index[1]].type == tile_type_enum.WALKABLE) 
			    actTiles.add(this.nodes[index[0]][index[1]]);
		    }
		    
		}
	    }
	}
    }
    
    printNeighborNodes(){
	for (let i = 0; i< this.dim[0]; i++){
	    for (let j = 0 ; j< this.dim[1]; j++){
		let currentNode = this.nodes[i][j];
		let print_str = "node ["+i+""+j+"]";  
		for (let k = 0 ; k < currentNode.neighborNodes.length; k++){
		    print_str = print_str + " "
			+""+currentNode.neighborNodes[k].i
			+""+currentNode.neighborNodes[k].j;
		    
		}
		console.log(print_str);
	    }
	}

    }
    

    calculateDistanceCost(node0, node1){
	return Math.abs(node0.i - node1.i) + Math.abs(node0.j - node1.j);
    }

    calculatePath(endI, endJ){
	let endNode = this.nodes[endI][endJ];
	let path = [];
	path.push(endNode);

	let currentNode = endNode;
	while (currentNode.parentNode != null){
	    path.push(currentNode.parentNode);
	    currentNode = currentNode.parentNode;
	}
	return path;
    }

    getLowestFCostNode(nodeSet){
	if (nodeSet.size <= 0)    return;
	let lowestFCostNode;
	let setFirst = false;
	for (let item of nodeSet){
	    if (!setFirst) {
		lowestFCostNode= item;
		setFirst = true;
	    }
	    
	    if (item.fCost < lowestFCostNode.fCost)
		lowestFCostNode = item;
	}
	return lowestFCostNode;
	
    }

    
    getLowestGCostNode(nodeSet){
	if (nodeSet.size <= 0)    return;
	let lowestGCostNode;
	let setFirst = false;
	for (let item of nodeSet){
	    if (!setFirst) {
		lowestGCostNode= item;
		setFirst = true;
	    }
	    
	    if (item.fCost < lowestGCostNode.fCost)
		lowestGCostNode = item;
	}
	return lowestGCostNode;
	
    }


}
