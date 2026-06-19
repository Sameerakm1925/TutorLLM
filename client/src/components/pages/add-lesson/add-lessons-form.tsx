import React, { useState } from "react";
import {
  Formik,
  FormikHelpers,
  Form,
  Field,
  ErrorMessage,
  FieldArray,
} from "formik";
import { toast } from "react-toastify";
import { Button } from "@material-tailwind/react";
import { TiTrash } from "react-icons/ti";
import QuizSwitch from "./quiz-switch";
import { Tooltip } from "@material-tailwind/react";
import { addLesson } from "../../../api/endpoints/course/lesson";
import { FormValuesLesson } from "../../../types/lesson";
import SpinnerDialog from "../../common/spinner-page";
import { lessonSchema } from "../../../validations/lesson";
import { useParams } from "react-router-dom";

const initialValues = {
  title: "",
  description: "",
  about: "",
  studyMaterials: "",
  contents: "",
  duration: "",
  videoUrl: "",
  questions: [
    {
      question: "",
      options: [{ option: "", isCorrect: false }],
    },
  ],
};

const AddLessonForm: React.FC = () => {
  const [addQuiz, setAddQuiz] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { courseId } = useParams();

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const handleSubmit = async (
    lesson: any,
    { resetForm }: FormikHelpers<any>,
  ) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      Object.keys(lesson).forEach((key) => {
        if (key === "questions") {
          formData.append(key, JSON.stringify(lesson[key]));
        } else {
          formData.append(key, lesson[key]);
        }
      });

      const response = await addLesson(courseId ?? "", formData);
      setIsUploading(false);
      resetForm();
      toast.success(response.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    } catch (error) {
      setIsUploading(false);
      toast.error("Failed to add lesson", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    }
  };

  return (
    <div className="flex justify-center items-center mt-10 pt-5 pb-10 text-customFontColorBlack">
      <div className="bg-white rounded-lg mx-10 border w-full p-6">
        <SpinnerDialog isUploading={isUploading} />
        <Formik
          initialValues={initialValues}
          validationSchema={lessonSchema}
          onSubmit={handleSubmit}
        >
          {({ values }) => (
            <Form className="mt-10 space-y-6">
              <div className="flex gap-4 justify-between">
                <div className="w-1/2">
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Title
                  </label>
                  <div className="mt-2">
                    <Field
                      id="title"
                      name="title"
                      type="text"
                      autoComplete="off"
                      required
                      className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-700 sm:text-sm sm:leading-6"
                    />
                    <ErrorMessage
                      name="title"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Description
                  </label>
                  <div className="mt-2">
                    <Field
                      id="description"
                      name="description"
                      type="text"
                      autoComplete="off"
                      required
                      className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-700 sm:text-sm sm:leading-6"
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-between">
                <div className="w-1/2">
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Contents
                  </label>
                  <div className="mt-2">
                    <Field
                      as="textarea"
                      id="contents"
                      name="contents"
                      rows={4}
                      className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-700 sm:text-sm sm:leading-6"
                    />
                    <ErrorMessage
                      name="contents"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    About
                  </label>
                  <div className="mt-2">
                    <Field
                      as="textarea"
                      id="about"
                      name="about"
                      rows={4}
                      className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-700 sm:text-sm sm:leading-6"
                    />
                    <ErrorMessage
                      name="about"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  YouTube Video URL
                </label>
                <div className="mt-2">
                  <Field
                    id="videoUrl"
                    name="videoUrl"
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-700 sm:text-sm sm:leading-6"
                  />
                  <ErrorMessage
                    name="videoUrl"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                {values.videoUrl && getYouTubeEmbedUrl(values.videoUrl) && (
                  <div className="mt-3">
                    <p className="text-sm text-green-600 mb-2">
                      ✓ Valid YouTube URL — Preview:
                    </p>
                    <iframe
                      width="100%"
                      height="250"
                      src={getYouTubeEmbedUrl(values.videoUrl) ?? ""}
                      title="YouTube Preview"
                      allowFullScreen
                      className="rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <QuizSwitch addQuiz={addQuiz} setAddQuiz={setAddQuiz} />
                </div>
                {addQuiz && (
                  <div className="max-w-md pt-10 mx-auto">
                    <FieldArray name="questions">
                      {({ push, remove: removeQuestion }) => (
                        <div>
                          {values.questions.map((_, index) => (
                            <div key={index} className="mb-4">
                              <div className="mb-2">
                                <label className="block font-bold mb-1 leading-6 text-gray-900">
                                  Question {index + 1}
                                </label>
                                <Field
                                  type="text"
                                  name={`questions.${index}.question`}
                                  className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-inset focus:ring-indigo-700 sm:text-sm sm:leading-6"
                                />
                                <ErrorMessage
                                  name={`questions.${index}.question`}
                                  component="div"
                                  className="text-red-500 text-xs"
                                />
                              </div>
                              <FieldArray name={`questions.${index}.options`}>
                                {({
                                  push: pushOption,
                                  remove: removeOption,
                                }) => (
                                  <div>
                                    {values.questions[index].options.map(
                                      (_, optionIndex) => (
                                        <div key={optionIndex} className="mb-2">
                                          <div className="flex items-center">
                                            <Field
                                              type="text"
                                              name={`questions.${index}.options.${optionIndex}.option`}
                                              className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-inset focus:ring-indigo-700 sm:text-sm sm:leading-6"
                                            />
                                            <Field
                                              type="checkbox"
                                              name={`questions.${index}.options.${optionIndex}.isCorrect`}
                                              className="ml-2"
                                            />
                                            <label className="ml-1">
                                              Correct
                                            </label>
                                            <Tooltip content="Delete option">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  removeOption(optionIndex)
                                                }
                                                className="text-red-500 ml-2"
                                              >
                                                <TiTrash size={20} />
                                              </button>
                                            </Tooltip>
                                          </div>
                                          <ErrorMessage
                                            name={`questions.${index}.options.${optionIndex}.option`}
                                            component="div"
                                            className="text-red-500 text-xs"
                                          />
                                        </div>
                                      ),
                                    )}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        pushOption({
                                          option: "",
                                          isCorrect: false,
                                        })
                                      }
                                      className="bg-blue-500 text-white px-4 text-xs py-2 rounded-lg"
                                    >
                                      Add Option
                                    </button>
                                  </div>
                                )}
                              </FieldArray>
                              <button
                                type="button"
                                onClick={() => removeQuestion(index)}
                                className="text-red-500 mt-2 text-xs"
                              >
                                Remove Question
                              </button>
                              <hr className="my-4" />
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              push({
                                question: "",
                                options: [{ option: "", isCorrect: false }],
                              })
                            }
                            className="bg-blue-500 text-white px-3 py-2 rounded-md text-xs"
                          >
                            Add Question
                          </button>
                        </div>
                      )}
                    </FieldArray>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <Button type="submit" color="blue">
                  Add Lesson
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddLessonForm;
