import { emptyMooe } from "@/helpers/emptyMooe/emptyMooe";
import { FieldType, laneMark, MooeDoc } from "@/types";
import { makeAutoObservable } from "mobx";

import Worker from "worker-loader!@/workers/worker.ts";
import DxfParser from 'dxf-parser';
import { getMooe } from "@/modules/modify/getMooe";
import { getDxfIdsData } from "@/helpers/get";

class ConverterStor {
    isLoading: boolean = false;
    dxfFileName: string | null = null;
    mooeFileName: string | null = null;
    loadingTime: number[] = [0, 0];
    isDXFMessageShow: boolean = false;
    isMOOEMessageShow: boolean = false;
    href: string = "";
    mooeDoc: MooeDoc = emptyMooe;

    dxfStr: string = "";
    mooeStr: string = "";

    inaccuracy: string = "0.001";
    permission: string = "0.1";

    diapasonPoints: { x: number, y: number }[] = [];
    missingPoints: string[] = [];

    isFarPointsModalOpen: boolean = false;
    isMissingPointsModalOpen: boolean = false;

    refTime: [number, number] = [0, 0];

    intervalDelay = 1000;

    values: FieldType = {
        rotAngle: "0",
        autocadPointX: "0",
        autocadPointY: "0",
        moeePointX: "0",
        moeePointY: "0",
        inaccuracy: this.inaccuracy,
        permission: this.permission,
    };

    // Дубли имён
    duplicatesNames: laneMark[][] = [];

    // Флаг модалки
    isNameDuplicatesModalOpen = false;

    constructor() {
        makeAutoObservable(this);
    }

    // Установка флага модалки
    setDuplicatePointNamesModalState = (val: boolean) => {
        this.isNameDuplicatesModalOpen = val;
    }

    setRotAngle = (val: string) => {
        this.values.rotAngle = val;
    }

    setRefTime = (val: [number, number]) => {
        this.refTime = val;
    }

    setDXFStr = (val: string) => {
        this.dxfStr = val;
        this.applyDXFData();
    }

    setMOOEStr = (val: string) => {
        this.mooeStr = val;
        this.applyScan(val);
    }

    setOpenFarPointsModal = (val: boolean) => {
        this.isFarPointsModalOpen = val;
    }

    setOpenMissingPointsModal = (val: boolean) => {
        this.isMissingPointsModalOpen = val;
    }

    setDiapasonPoints = (points: { x: number, y: number }[]) => {
        this.diapasonPoints = points;
    }

    setMissingPoints = (names: string[]) => {
        this.missingPoints = names;
    }

    setInaccuracy = (val: string) => {
        this.inaccuracy = val;
    }

    setPermission = (val: string) => {
        this.permission = val;
    }



    applyValues = (values: FieldType) => {



        const shiftX = Number(values.moeePointX) - Number(values.autocadPointX);
        const shiftY = Number(values.moeePointY) - Number(values.autocadPointY);

        this.setMooeDoc({
            ...this.mooeDoc,
            mLaneMarks: this.mooeDoc.mLaneMarks.map(obj => ({
                ...obj,
                mLaneMarkXYZW: {
                    ...obj.mLaneMarkXYZW,
                    x: obj.mLaneMarkXYZW.x + shiftX,
                    y: obj.mLaneMarkXYZW.y + shiftY,
                }
            })),

            mRoads: this.mooeDoc.mRoads.map((obj: any) => {

                if (obj.mLanes[0].hasOwnProperty('mBezierControl')) {
                    return {
                        ...obj,

                        mLanes: [
                            {
                                ...obj.mLanes[0],

                                mBezierControl: {
                                    ...obj.mLanes[0]?.mBezierControl,
                                    x: obj.mLanes[0]?.mBezierControl.x + shiftX,
                                    y: obj.mLanes[0]?.mBezierControl.y + shiftY
                                }
                            }
                        ]
                    }
                }

                if (obj.mLanes[0].hasOwnProperty('m_BezierControl1')) {
                    return {
                        ...obj,

                        mLanes: [
                            {
                                ...obj.mLanes[0],

                                m_BezierControl1: {
                                    ...obj.mLanes[0]?.m_BezierControl1,
                                    x: obj.mLanes[0]?.m_BezierControl1.x + shiftX * 50,
                                    y: obj.mLanes[0]?.m_BezierControl1.y + shiftY * 50 * -1
                                },

                                m_BezierControl2: {
                                    ...obj.mLanes[0]?.m_BezierControl2,
                                    x: obj.mLanes[0]?.m_BezierControl2.x + shiftX * 50,
                                    y: obj.mLanes[0]?.m_BezierControl2.y + shiftY * 50 * -1
                                }
                            }
                        ]
                    }
                }

                return { ...obj }

            }),

            mapRotateAngle: Number(values.rotAngle),

        });

        this.isLoading = false;

        this.applyScan();

    }




    setParams = (values: FieldType) => {

        this.values = values;

        this.isLoading = true;

        setTimeout(() => this.applyValues(values));

    }

    applyScan = (mooeStr?: string) => {
        try {

            if (this.mooeStr) {
                const mooeJson = JSON.parse(this.mooeStr);

                this.mooeDoc.mSceneMap.mGridMsg.data = mooeJson.mSceneMap.mGridMsg.data;
            }

            if (mooeStr) {
                const mooeJson = JSON.parse(mooeStr);

                this.mooeDoc.mSceneMap.mGridMsg.data = mooeJson.mSceneMap.mGridMsg.data;

                this.setHref(this.mooeDoc);
            }

            this.setIsLoading(false);

        } catch (err: any) {
            return console.error(err.stack);
        }
    }

    applyDXFData = () => {
        this.setMooeDoc(emptyMooe);

        this.applyScan();

        try {

            const interval = setInterval(() => {

                if (this.refTime[1] === 59) {
                    this.setLoadingTime([this.refTime[0] + 1, 0]);
                    this.refTime[0] += 1;
                    this.refTime[1] = 0;
                }
                else {
                    this.setLoadingTime([this.refTime[0], this.refTime[1] + 1]);
                    this.refTime[1] += 1;
                }

            }, this.intervalDelay);

            if (globalThis.window && globalThis.Worker) {

                console.time("Converting files");

                const worker = new Worker();

                worker.postMessage({
                    dxfStr: JSON.parse(JSON.stringify(this.dxfStr)),
                    mooeDoc: JSON.parse(JSON.stringify(this.mooeDoc)),
                    permission: JSON.parse(JSON.stringify(this.permission)),
                    inaccuracy: JSON.parse(JSON.stringify(this.inaccuracy))
                });

                worker.onmessage = evt => {

                    const data = JSON.parse(JSON.stringify(evt.data));

                    data.diapasonPoints.length && this.setOpenFarPointsModal(true);
                    data.missingPoints.length && this.setOpenMissingPointsModal(true);

                    this.setMooeDoc(data.mooeDoc);

                    this.applyValues(this.values);

                    this.setDiapasonPoints(data.diapasonPoints);
                    this.setMissingPoints(data.missingPoints);

                    this.setIsLoading(false);

                    clearInterval(interval);

                    console.timeEnd("Converting files");
                };

            }
            else {
                console.time("Converting files");

                console.log("Web worker не поддерживается браузером!");

                const parser = new DxfParser();

                const dxf = parser.parse(this.dxfStr);

                console.log("dxf: ", dxf);

                const dxfIdsData = getDxfIdsData(this.dxfStr);

                const data = dxf
                    ? getMooe(dxf, dxfIdsData, this.mooeDoc, this.permission, this.inaccuracy)
                    : { mooeDoc: emptyMooe, diapasonPoints: [], missingPoints: [] };

                // set diapason points
                data.diapasonPoints.length && this.setOpenFarPointsModal(true);
                this.setDiapasonPoints(data.diapasonPoints);

                // set missing points
                data.missingPoints.length && this.setOpenMissingPointsModal(true);
                this.setMissingPoints(data.missingPoints);

                this.setMooeDoc(data.mooeDoc);

                this.applyValues(this.values);

                this.setIsLoading(false);

                clearInterval(interval);

                console.timeEnd("Converting files");
            }

        } catch (err: any) {
            return console.error(err.stack);
        }
    }

    setLoadingTime = (val: number[]) => this.loadingTime = val;

    setIsMessageShow = (val: boolean, ext?: string) => {

        switch (ext) {
            case "dxf":
                this.isDXFMessageShow = val;
                break;
            case "mooe":
                this.isMOOEMessageShow = val;
                break;
            default:
                this.isDXFMessageShow = val;
                break;
        }

    }

    setDXFFileName = (val: string | null) => this.dxfFileName = val;
    setMOOEFileName = (val: string | null) => this.mooeFileName = val;
    setIsLoading = (val: boolean) => this.isLoading = val;

    setHref = (doc: MooeDoc) => {

        // Получение дубликатов имён
        const pointList = doc?.mLaneMarks.filter((obj: laneMark) => obj.mLaneMarkName).reduce((accum: any, obj: laneMark) => {

            if (accum.points[obj.mLaneMarkName]) {
                accum.points[obj.mLaneMarkName].push(obj);
            }
            else {
                accum.points[obj.mLaneMarkName] = [obj];
            }

            return accum;
        }, { points: {} });

        const dublicates = (Object.values(pointList.points) as laneMark[][]).filter((arr: laneMark[]) => arr.length > 1);

        this.duplicatesNames = dublicates;

        dublicates.length && (this.isNameDuplicatesModalOpen = true);

        const newDock = JSON.stringify(doc);

        const file = new Blob([newDock as unknown as string], { type: 'application/mooe' });
        const url = URL.createObjectURL(file);

        this.href = doc.mLaneMarks.length ? url : "";
    }

    setMooeDoc = (doc: MooeDoc) => {
        this.mooeDoc = doc;
        this.setHref(doc);
    }
}

export const store = new ConverterStor();
