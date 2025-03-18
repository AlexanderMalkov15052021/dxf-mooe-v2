import { distToCachePoint, distToTargrtPoint, maxDist, scaleCorrection } from "@/constants";
import { cachePoint } from "@/helpers/elements/cachePoint";
import { targetPoint } from "@/helpers/elements/targetPoint";
import { windingPoint } from "@/helpers/elements/windingPoint";
// import { getDistToRoad, getRoadAngle, getRoadEndCoord } from "@/helpers/get";
import { getAtan2, getDistPointToline, getPerpendicularBase } from "@/helpers/math";
import { Coords, DXFDataType, MooeDoc } from "@/types";

export const setPalletPoints = (
    mooeDoc: MooeDoc, dxfIdsList: Record<string, string[]>, DXFData: DXFDataType
) => {

    const missingPoints: string[] = [];

    const origin: Coords = DXFData.origin;

    DXFData.pallets?.map((obj: any) => {

        const pointX = (obj.position.x + origin.x) * scaleCorrection;
        const pointY = (obj.position.y + origin.y) * scaleCorrection;

        const lineData = DXFData.palletLines.reduce((accum: { dist: number, line: any }, line: any) => {

            const dist = getDistPointToline(
                pointX,
                pointY,
                (line.vertices[0].x + origin.x) * scaleCorrection,
                (line.vertices[0].y + origin.y) * scaleCorrection,
                (line.vertices[1].x + origin.x) * scaleCorrection,
                (line.vertices[1].y + origin.y) * scaleCorrection
            );

            if (dist < accum.dist) {
                accum.dist = dist;
                accum.line = {
                    ...line, vertices: [
                        { x: line.vertices[0].x + origin.x, y: line.vertices[0].y + origin.y },
                        { x: line.vertices[1].x + origin.x, y: line.vertices[1].y + origin.y }
                    ]
                };
            }

            return accum;

        }, { dist: maxDist, line: null });

        const angle = getAtan2(
            lineData.line.vertices[0].x,
            lineData.line.vertices[0].y,
            lineData.line.vertices[1].x,
            lineData.line.vertices[1].y
        );

        const distToRoad = getDistPointToline(
            pointX,
            pointY,
            lineData.line.vertices[0].x * scaleCorrection,
            lineData.line.vertices[0].y * scaleCorrection,
            lineData.line.vertices[1].x * scaleCorrection,
            lineData.line.vertices[1].y * scaleCorrection
        );

        // to align the base point to the center
        const perpendicularBase = getPerpendicularBase(lineData.line.vertices[0], lineData.line.vertices[1], pointX, pointY);

        const angleToBasePoint = getAtan2(
            pointX,
            pointY,
            perpendicularBase.x,
            perpendicularBase.y
        );

        const windingPointId = dxfIdsList[obj.handle];

        mooeDoc.mLaneMarks.push(windingPoint(
            windingPointId?.length ? Number(windingPointId[0]) : 0,
            angleToBasePoint ? pointX + (distToRoad * Math.cos(angleToBasePoint)) : pointX,
            angleToBasePoint ? pointY + (distToRoad * Math.sin(angleToBasePoint)) : pointY,
            angle,
            obj.text.replace(" ", "")
        ));

        const targetPalletPoints = DXFData.targetPalletPoints.find((target: any) => target.text.includes(obj.text));
        const turningPalletPoints = DXFData.turningPalletPoints.find((turning: any) => turning.text.includes(obj.text));
        const cachePalletPoints = DXFData.cachePalletPoints.find((cache: any) => cache.text.includes(obj.text));

        // adding target point
        if (targetPalletPoints) {
            const targetPointId = dxfIdsList[targetPalletPoints?.handle ?? 0];

            mooeDoc.mLaneMarks.push(targetPoint(
                targetPointId?.length ? Number(targetPointId[0]) : 0,
                targetPointId?.length
                    ? targetPalletPoints.position.x * scaleCorrection
                    : pointX + (distToTargrtPoint * Math.cos(angle)),
                targetPointId?.length
                    ? targetPalletPoints.position.y * scaleCorrection
                    : pointY + (distToTargrtPoint * Math.sin(angle)),
                angle,
                targetPointId?.length
                    ? targetPalletPoints.text.replace(" ", "")
                    : `${obj.text.replace(" ", "")}检`
            ));
        }
        else {
            missingPoints.push(`target point - ${obj.text.replace(" ", "")}`);
        }

        // adding cache point
        if (cachePalletPoints) {
            const cachePointId = dxfIdsList[cachePalletPoints?.handle ?? 0];

            mooeDoc.mLaneMarks.push(cachePoint(
                cachePointId?.length ? Number(cachePointId[0]) : 0,
                cachePointId?.length
                    ? cachePalletPoints.position.x * scaleCorrection
                    : pointX + (distToCachePoint * Math.cos(angle)),
                cachePointId?.length
                    ? cachePalletPoints.position.y * scaleCorrection
                    : pointY + (distToCachePoint * Math.sin(angle)),
                angle,
                cachePointId?.length
                    ? cachePalletPoints.text.replace(" ", "")
                    : `${obj.text.replace(" ", "")}识别`
            ));
        }
        else {
            missingPoints.push(`cache point - ${obj.text.replace(" ", "")}`);
        }

        // adding missing turning point
        turningPalletPoints ?? missingPoints.push(`turning point - ${obj.text.replace(" ", "")}`);

    });

    return missingPoints;
}