import { MooeDoc } from "@/types";
import { getPointIdsBuffer } from "../extract/getPointIdsBuffer";

export const setNewIds = (mooeDoc: MooeDoc) => {

    const pointIdsBuffer = getPointIdsBuffer(mooeDoc);

    mooeDoc.mLaneMarks.map((obj, index: number) => obj.mLaneMarkID === 0 && (obj.mLaneMarkID = pointIdsBuffer[index]));

}