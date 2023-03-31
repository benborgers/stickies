type Note = {
  tempId?: string;

  id: string;
  user: string;
  text: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  hidden: boolean;
};

export default Note;
