import { atom } from "nanostores";
import type User from "../types/user";

const user = atom<null | User>(null);
export default user;
