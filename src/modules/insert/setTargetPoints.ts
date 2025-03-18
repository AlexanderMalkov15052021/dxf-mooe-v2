import { maxDist, scaleCorrection } from "@/constants";
import { targetPoint } from "@/helpers/elements/targetPoint";
import { getAtan2, getDistPointToline } from "@/helpers/math";
import { Coords, dxfIdsBuff, MooeDoc } from "@/types";

export const setTargetPoints = (mooeDoc: MooeDoc, targetPoints: any, lines: any, origin: Coords, dxfIdsBuff: dxfIdsBuff) => {

    const newPoints: number[] = [];

    targetPoints?.map((obj: any, index: number) => {

        const xData = obj?.extendedData?.customStrings[0];

        const xDataPointId: number = xData?.split(" ")?.reverse()[0];

        const pointX = (obj.position.x + origin.x) * scaleCorrection;
        const pointY = (obj.position.y + origin.y) * scaleCorrection;

        const lineData = lines.reduce((accum: { dist: number, line: any }, line: any) => {

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
                };;
            }

            return accum;

        }, { dist: maxDist, line: null });

        const angle = getAtan2(
            lineData.line.vertices[0].x,
            lineData.line.vertices[0].y,
            lineData.line.vertices[1].x,
            lineData.line.vertices[1].y
        );

        const nameParts = obj.text.split("\\");


        if (nameParts.length > 1) {

            xDataPointId ?? newPoints.push(dxfIdsBuff.pointIds[index]);

            mooeDoc.mLaneMarks.push(targetPoint(
                xDataPointId ?? dxfIdsBuff.pointIds[index],
                pointX,
                pointY,
                angle,
                `${nameParts[0].replace("{", "").replace("}", "")}前置点`
            ));
        }
        else {

            xDataPointId ?? newPoints.push(dxfIdsBuff.pointIds[index]);

            mooeDoc.mLaneMarks.push(targetPoint(
                xDataPointId ?? dxfIdsBuff.pointIds[index],
                pointX,
                pointY,
                angle,
                nameParts[0].replace("{", "").replace("}", "")
            ));
        }

    });

    dxfIdsBuff.pointIds = dxfIdsBuff.pointIds.filter(id => !newPoints.includes(id));

}