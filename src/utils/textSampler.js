

export const sampleText=(text,width,height,fontSize=100)=>{
    const canvas=document.createElement('canvas');
    const ctx=canvas.getContext('2d');

    canvas.width=width;
    canvas.height=height;

    ctx.font=`bold ${fontSize}px arial`;
    ctx.fillStyle='white';
    ctx.textAlign='center';
    ctx.textBaseline='middle';

    ctx.fillText(text, width/2, height/2);

    const imageData=ctx.getImageData(0,0,width,height);
    const data=imageData.data;

    const points=[];

    const gap=3

    for(let y=0;y <height;y +=gap){
        for (let x=0; x<width;x+=gap){
            const index=(y * width + x) *4+3;
            const alpha=data[index];
            if(alpha > 0){
                points.push({
                    x:(x/width) * 20 -10,
                    y:-(y/height) * 20 +10,
                });
            }
        }
    }
    return points;
};