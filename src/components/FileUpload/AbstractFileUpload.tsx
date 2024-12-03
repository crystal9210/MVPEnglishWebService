import { validateWithSchema } from "@/utils/validateWirhSchema";
import React from "react";
import { ZodSchema } from "zod";

interface AbstractFileUploadProps {
    schema: ZodSchema<any>; // TODO ジェネリクス化したほうが？ - ジェネリクスTのハンドリング
    onSuccess: (file: File) => void;
    onError: (Message: string) => void;
}

const AbstractFileUpload = (props: AbstractFileUploadProps): JSX.Element => {
    const { schema, onSuccess, onError} = props;
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileData = {
            name: file.name,
            extension: file.name.split(".").pop() || "", // .jpgなどファイル拡張子
        };

        const errorMessage = validateWithSchema(schema, fileData);

        if (errorMessage) {
            onError(errorMessage);
        } else {
            onSuccess(file);
        }
    };

    return <input type="file" onChange={handleFileChange}/>;
}

export default AbstractFileUpload;
