

function printVec2(pre_str=null, i, j, post_str=null){
    return console.log(pre_str+ "["+i+" "+j +"] "+post_str);
}

function printVec2XYtoIJ(pre_str=null, x, y, post_str=null){
    return console.log(pre_str
		       + "["+systemGrid.xToI(x)+" "+ systemGrid.yToJ(y)+"] "
		       +post_str);
}

function getStrXYtoIJ(x, y){
    return "["+systemGrid.xToI(x)+" "+ systemGrid.yToJ(y)+"] ";
}


function printEventKey(key, stateStr){
    console.log(key+" key pressed in "+stateStr);
}
