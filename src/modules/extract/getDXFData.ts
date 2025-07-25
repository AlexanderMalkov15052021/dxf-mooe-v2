import { Coords } from "@/types";
import { IDxf, IViewPort } from "dxf-parser";

type DXFData = {
    quadraticSpline: any;
    streamPallets: any;
    targetPoints: any;
    gatePallets: any;
    palletLines: any;
    chargeLines: any;
    cubicSpline: any;
    gateLines: any;
    restLines: any;
    charges: any;
    pallets: any;
    lines: any;
    rests: any;
    layer: any;

    targetChargePoints: any;
    turningChargePoints: any;

    targetRestPoints: any;
    turningRestPoints: any;

    targetPalletPoints: any;
    turningPalletPoints: any;
    cachePalletPoints: any;

    otheTargetPoints: any;

    prePoints: any;
};

export const getDXFData = (dxf: IDxf) => {

    const entities = dxf?.entities.reduce<DXFData>((accum: any, obj: any) => {

        obj.layer === "Quadratic spline roads" && accum.quadraticSpline.push(obj);
        obj.layer === "Cubic spline roads" && accum.cubicSpline.push(obj);
        obj.layer === "Layer" && (accum.layer = obj);
        obj.layer === "Rest points" && accum.rests.push(obj);

        obj.layer === "Straight roads" && accum.lines.push(obj);
        obj.layer === "Bidirectional roads" && accum.lines.push(obj);

        obj.layer === "Charge points" && accum.charges.push(obj);
        obj.layer === "Charge roads" && accum.chargeLines.push(obj);
        obj.layer === "Rest roads" && accum.restLines.push(obj);
        obj.layer === "Pallet roads" && accum.palletLines.push(obj);
        obj.layer === "Flow roads" && accum.gateLines.push(obj);

        obj.layer === "Flow pallets" && accum.gatePallets.push(obj);
        obj.layer === "Alley pallets" && accum.streamPallets.push(obj);

        obj.layer === "Pallet points" && accum.pallets.push(obj);

        obj.layer === "Target points" && accum.targetPoints.push(obj);

        obj.layer === "Target charge points" && accum.targetChargePoints.push(obj);
        obj.layer === "Turning charge points" && accum.turningChargePoints.push(obj);

        obj.layer === "Target rest points" && accum.targetRestPoints.push(obj);
        obj.layer === "Turning rest points" && accum.turningRestPoints.push(obj);

        obj.layer === "Target pallet points" && accum.targetPalletPoints.push(obj);
        obj.layer === "Turning pallet points" && accum.turningPalletPoints.push(obj);
        obj.layer === "Cache pallet points" && accum.cachePalletPoints.push(obj);

        obj.layer === "Othe target points" && accum.otheTargetPoints.push(obj);

        obj.layer === "Pre points" && accum.prePoints.push(obj);

        return accum;
    }, {
        quadraticSpline: [],
        streamPallets: [],
        targetPoints: [],
        gatePallets: [],
        palletLines: [],
        chargeLines: [],
        cubicSpline: [],
        gateLines: [],
        restLines: [],
        charges: [],
        pallets: [],
        lines: [],
        rests: [],

        targetChargePoints: [],
        turningChargePoints: [],

        targetRestPoints: [],
        turningRestPoints: [],

        targetPalletPoints: [],
        turningPalletPoints: [],
        cachePalletPoints: [],

        otheTargetPoints: [],

        prePoints: [],

        layer: null
    });

    const viewPorts: IViewPort[] = dxf?.tables?.viewPort?.viewPorts;

    const origin: Coords = viewPorts.length
        ? {
            x: dxf.tables.viewPort.viewPorts[0].ucsOrigin.x * -1,
            y: dxf.tables.viewPort.viewPorts[0].ucsOrigin.y * -1,
            z: dxf.tables.viewPort.viewPorts[0].ucsOrigin.z * -1
        }
        : { x: 0, y: 0, z: 0 };

    return { ...entities, origin }

}