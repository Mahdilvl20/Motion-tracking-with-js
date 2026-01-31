export const Lerp=(start,end,t) => start + (end - start) * t;


export const getDistacne=(x1,x2,y1,y2) =>{
    const dx=x1-x2;
    const dy=y1-y2;
    return Math.hypot(dx,dy);
}

export const getAngel=(x1,x2,y1,y2) => {
    const dx=x1-x2;
    const dy=y1-y2;
    return Math.atan2(dx,dy);
}

export const mapRange=(value,inMin,inMax,outMin,outMax) => ((value-inMin)*(outMax-outMin)) / (inMax-inMin) + outMin;