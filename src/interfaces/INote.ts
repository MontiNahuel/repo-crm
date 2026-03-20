import { type IBasicUser } from "./IUser";

export interface INote {
    id: number;
    contenido: String;
    fecha_creacion: string;
    autor: IBasicUser;
}

export interface INoteClient extends INote {
    cliente_id: number;
}

export interface INoteCreate {
    cliente_id: number;
    contenido: String;
}