import { IDxf } from "dxf-parser";
import { setLines } from "../insert/setLines";
import { setQuadraticSpline } from "../insert/setQuadraticSpline";
import { setLayerSize } from "../insert/setLayerSize";
import { setRestPoints } from "../insert/setRestPoints";
import { setChargePoints } from "../insert/setChargePoints";
import { getDXFData } from "../extract/getDXFData";
import { setCubicSpline } from "../insert/setCubicSpline";
import { DXFDataType, DxfIdsData, MooeDoc } from "@/types";
import { setTargetPoints } from "../insert/setTargetPoints";
import { setNewIds } from "../insert/setNewIds";
import { setPalletPoints } from "../insert/setPalletPoints";
import { setPrePoints } from "../insert/setPrePoints";

export const getMooe = (dxf: IDxf, dxfIdsData: DxfIdsData, mooeDoc: MooeDoc, permission: string, inaccuracy: string) => {
    const dxfIdsList = dxfIdsData.dxfIdsList;
    const dxfIdsBuff = dxfIdsData.dxfIdsBuff;

    const numPerm = Number(permission);
    const numInc = Number(inaccuracy);

    const DXFData: DXFDataType = getDXFData(dxf);

    const lines = [...DXFData.lines, ...DXFData.chargeLines, ...DXFData.restLines, ...DXFData.palletLines, ...DXFData.gateLines];

    const linePointsDiapason = setLines(
        mooeDoc, dxfIdsList, dxfIdsBuff, lines, numPerm, numInc, DXFData.origin
    );

    const cubicSplinePointsDiapason = setCubicSpline(
        mooeDoc, dxfIdsList, dxfIdsBuff, DXFData.cubicSpline, numPerm, numInc, DXFData.origin
    );

    const quadraticSplinePointsDiapason = setQuadraticSpline(
        mooeDoc, dxfIdsList, dxfIdsBuff, DXFData.quadraticSpline, numPerm, numInc, DXFData.origin
    );


    const missingPalletPoints = setPalletPoints(mooeDoc, dxfIdsList, DXFData);

    const missingRestPoints = setRestPoints(mooeDoc, dxfIdsList, DXFData);

    const missingChargePoints = setChargePoints(mooeDoc, dxfIdsList, DXFData);


    DXFData.turningPalletPoints && setTargetPoints(
        mooeDoc,
        [...DXFData.turningPalletPoints, ...DXFData.turningRestPoints, ...DXFData.turningChargePoints],
        lines,
        DXFData.origin,
        dxfIdsBuff
    );

    DXFData.targetPoints && setTargetPoints(
        mooeDoc,
        DXFData.targetPoints,
        lines,
        DXFData.origin,
        dxfIdsBuff
    );

    // Установка пре-поинтов
    DXFData.prePoints && setPrePoints(
        mooeDoc,
        DXFData.prePoints,
        lines,
        DXFData.origin,
        dxfIdsBuff
    );

    DXFData.otheTargetPoints && setTargetPoints(
        mooeDoc,
        DXFData.otheTargetPoints,
        lines,
        DXFData.origin,
        dxfIdsBuff
    );


    DXFData.layer && setLayerSize(mooeDoc, DXFData.layer, DXFData.origin);


    setNewIds(mooeDoc);


    return {
        mooeDoc,
        diapasonPoints: [...linePointsDiapason, ...cubicSplinePointsDiapason, ...quadraticSplinePointsDiapason],
        missingPoints: [...missingPalletPoints, ...missingRestPoints, ...missingChargePoints]
    };

}