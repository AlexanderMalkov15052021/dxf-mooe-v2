import { ConverterStor } from "@/entities";
import { observer } from "mobx-react-lite";

const TypeErrorMessage = observer(() => {

    const {
        store: { isDXFMessageShow, isMOOEMessageShow },
    } = ConverterStor;

    return (isDXFMessageShow || isMOOEMessageShow) && <p className={"message"}>
        {`Необходим файл с расширением ${isDXFMessageShow ? ".dxf" : ".mooe"}`}
    </p>
});

export default TypeErrorMessage;