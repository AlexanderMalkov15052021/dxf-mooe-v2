import { emptyMooe } from '@/helpers/emptyMooe/emptyMooe';
import { getDxfIdsData } from '@/helpers/get';
import { getMooe } from '@/modules/modify/getMooe';
import DxfParser from 'dxf-parser';

const ctx: Worker = self as any;

const sendDXF = (evt: any) => {

    const parser = new DxfParser();

    const dxf = parser.parse(evt.data.dxfStr);

    const dxfIdsData = getDxfIdsData(evt.data.dxfStr);

    console.log("dxf: ", dxf);

    const data = dxf
        ? getMooe(dxf, dxfIdsData, evt.data.mooeDoc, evt.data.permission, evt.data.inaccuracy)
        : { mooeDoc: emptyMooe, diapasonPoints: [], missingPoints: [] };

    ctx.postMessage({
        mooeDoc: JSON.parse(JSON.stringify(data.mooeDoc)),
        diapasonPoints: JSON.parse(JSON.stringify(data.diapasonPoints)),
        missingPoints: JSON.parse(JSON.stringify(data.missingPoints))
    });
}

ctx.addEventListener("message", sendDXF);