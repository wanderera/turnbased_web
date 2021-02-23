const tile_type = {
    WALKABLE:0,
    BLOCKING:1,
    SEETHOUGH:2
}


class GridNode{
    constructor(i, j, type=tile_type.WALKABLE, moveCost=1){
	
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
	if (type == tile_type.WALKABLE){
	    this.moveCost = 1;
	}else
	    this.moveCost = Number.MAX_VALUE;
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


    findPath(startI, startJ, endI, endJ){

	this.openSet.clear();
	this.closedSet.clear();
	this.calculateNeighborNodes();
	
	if (startI < 0 || startJ < 0 ||
	    startI >= this.size || startJ >= this.size ||
	    startI < 0 || startJ < 0 ||
	    startI >= this.size || startJ >= this.size)
	{
	    console.log("invalid path finding input" +
			" ["+ startI +", ",+startJ+"] to" +
		        " ["+endI, +", "+endJ+"]");
	    return;
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
		return this.calculatePath(endI, endJ);
	    }
	    
	    this.openSet.delete(currentNode);

	    for (let neighbor of currentNode.neighborNodes){
		if (this.closedSet.has(neighbor)) continue;
		let tmpGCost = currentNode.gCost + this.calculateDistanceCost(currentNode, neighbor);
		
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

		
		buffer.font = '3px';
		buffer.fillStyle = 'white';
		buffer.fillText(this.nodes[i][j].moveCost==1?1:"inf1",
				(i+0.3)*this.size + offset_x,
				(j+0.7)*this.size + offset_y)

		
		buffer.font = '1px';
		buffer.fillStyle = 'blue';
		buffer.fillText(this.nodes[i][j].type,
				(i+0.5)*this.size + offset_x,
				(j+0.9)*this.size + offset_y)
	    }
	}   

    }

    drawPath(path, offset_x=0, offset_y=0){
	if (path == null) return;
	buffer.lineWidth = 1;
	buffer.strokeStyle = "green11";
	
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

    // helper functions

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
			if (neighbor.type == tile_type.WALKABLE)
			    currentNode.neighborNodes.push(neighbor);
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
    


}
