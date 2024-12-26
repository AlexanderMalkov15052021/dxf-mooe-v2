import { ConverterStor } from "@/entities";
import { observer } from "mobx-react-lite";
import { ChangeEvent, FormEvent } from "react";

const UploadMOOE = observer(() => {

    const {
        store: {
            isLoading, mooeFileName, setIsMessageShow, setIsLoading, setLoadingTime, setMOOEFileName,
            setMOOEStr, setRefTime
        },
    } = ConverterStor;

    const readFile = (evt: ChangeEvent<HTMLInputElement>) => {

        if (!evt.target.files) return;

        if (evt.target.files[0].name.split(".").at(-1) !== "mooe") {
            setIsMessageShow(true, "mooe");
            return
        };

        setIsLoading(true);

        const file = evt.target.files[0];
        const reader = new FileReader();
        reader.readAsText(file);

        setMOOEFileName(file.name);

        reader.onload = async () => {

            setMOOEStr(reader.result as string);

        };

        reader.onerror = () => {
            console.error(reader.error);
        };

    }

    const restFiles = (evt: FormEvent<HTMLFormElement>) => {
        setIsMessageShow(false, "mooe");
        evt.currentTarget.reset();
        setMOOEFileName(null);
        setLoadingTime([0, 0]);
        setRefTime([0, 0]);
    }

    return <>
        <form onClick={isLoading ? evt => evt.preventDefault() : restFiles}>
            <label htmlFor="mooe-upload" className={isLoading ? "disabledUpload custom-file-upload" : "custom-file-upload"}>
                {mooeFileName ? mooeFileName : "Выберите файл .mooe"}
            </label>
            <input id="mooe-upload" type="file" onChange={isLoading ? evt => evt.preventDefault() : readFile} />
        </form>
    </>
});

export default UploadMOOE;