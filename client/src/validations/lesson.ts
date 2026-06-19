import * as Yup from "yup";
export const lessonSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
    contents: Yup.string().required("Contents are required"),
    about: Yup.string().required("About is required"),
    videoUrl: Yup.string().url("Must be a valid URL").optional(),
});