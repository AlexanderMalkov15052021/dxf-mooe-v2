import { ConverterStor } from "@/entities";
import { observer } from "mobx-react-lite";
import { ChangeEvent, FormEvent } from "react";

import { emptyMooe } from "@/helpers/emptyMooe/emptyMooe";

import { Modal } from "antd/lib";
import { laneMark } from "@/types";

import styles from "./UploadForm.module.css"

const UploadForm = observer(() => {

    const {
        store: {
            isLoading, dxfFileName, isFarPointsModalOpen, isMissingPointsModalOpen, diapasonPoints, missingPoints,
            isNameDuplicatesModalOpen, duplicatesNames,
            setIsMessageShow, setIsLoading, setLoadingTime, setDXFFileName, setMooeDoc,
            setOpenFarPointsModal, setOpenMissingPointsModal, setDXFStr, setRefTime,
            setDuplicatePointNamesModalState
        },
    } = ConverterStor;

    const readFile = (evt: ChangeEvent<HTMLInputElement>) => {

        if (!evt.target.files) return;

        if (evt.target.files[0].name.split(".").at(-1) !== "dxf") {
            setIsMessageShow(true, "dxf");
            return
        };

        setIsLoading(true);

        const file = evt.target.files[0];
        const reader = new FileReader();
        reader.readAsText(file);

        setDXFFileName(file.name);

        reader.onload = async () => {

            setDXFStr(reader.result as string);

        };

        reader.onerror = () => {
            console.error(reader.error);
        };

    }

    const restFiles = (evt: FormEvent<HTMLFormElement>) => {
        setIsMessageShow(false, "dxf");
        evt.currentTarget.reset();
        setDXFFileName(null);
        setLoadingTime([0, 0]);
        setMooeDoc(emptyMooe);
        setRefTime([0, 0]);
    }

    // При завершении просмотра дублей
    const duplicateNamesClickHandler = () => {
        setDuplicatePointNamesModalState(false);
    }
    const duplicateNamesCancelHandler = () => {
        setDuplicatePointNamesModalState(false);
    }

    const handleOk = () => {
        setOpenFarPointsModal(false);
    }

    const handleCancel = () => {
        setOpenFarPointsModal(false);
    }

    const missingPointsModalOkHandler = () => {
        setOpenMissingPointsModal(false);
    }

    const missingPointsModalCancelHandler = () => {
        setOpenMissingPointsModal(false);
    }

    return <>
        <form onClick={isLoading ? evt => evt.preventDefault() : restFiles}>
            <label htmlFor="file-upload" className={isLoading ? "disabledUpload custom-file-upload" : "custom-file-upload"}>
                {dxfFileName ? dxfFileName : "Выберите файл .dxf"}
            </label>
            <input id="file-upload" type="file" onChange={isLoading ? evt => evt.preventDefault() : readFile} />
        </form>
        <Modal title="Координаты точек с погрешностью" open={isFarPointsModalOpen} onOk={handleOk} onCancel={handleCancel}>
            {diapasonPoints.map((poin, index: number) =>
                <div key={index}>
                    <span>x: </span><span>{poin.x}</span>
                    <span>y: </span><span>{poin.y}</span>
                </div>
            )}
        </Modal>
        <Modal
            title="Отсутствующие точки"
            open={isMissingPointsModalOpen}
            onOk={missingPointsModalOkHandler}
            onCancel={missingPointsModalCancelHandler}
        >
            {missingPoints.map((name: string, index: number) =>
                <div key={index}>
                    <span>{name}</span>
                </div>
            )}
        </Modal>

        {/* 🔻 Модалка дублей имён 🔻 */}
        <Modal
            title="Сдублированные названия точек"
            open={isNameDuplicatesModalOpen}
            onOk={duplicateNamesClickHandler}
            onCancel={duplicateNamesCancelHandler}
        >
            {duplicatesNames.flatMap((poin: laneMark[]) => {
                return <div className={styles.duplicatesNamesWrapper}>
                    {
                        poin.map((obj: laneMark, index: number) => {
                            return <div className={styles.duplicatesNamesBlock} key={`${obj.mLaneMarkName}-${index}`}>
                                <div className={styles.duplicatesNamesTitle}><span>Название: </span><span>{obj.mLaneMarkName}</span></div>
                                <div  className={styles.duplicatesNamesCoords}>
                                    <div><span>x: </span><span>{obj.mLaneMarkXYZW.x}</span></div>
                                    <div><span>y: </span><span>{obj.mLaneMarkXYZW.y}</span></div>
                                </div>
                            </div>
                        })
                    }
                </div>
            })}
        </Modal>
    </>
});

export default UploadForm;