


function getMHTDist(pos0_x, pos0_y, pos1_x, pos1_y){
    return Math.abs(pos0_x - pos1_x) + Math.abs(pos0_y - pos1_y);
}

function getLineDistSq(pos0_x, pos0_y, pos1_x, pos1_y){
    return (Math.pow(pos0_x - pos1_x,2) + Math.pow(pos0_y - pos1_y, 2));
}

function getDistVec2(from, to){
    return [to[0] - from[0], to[1] - from[1]];
}
