import { useState } from "react";

export default function useForm({
  initialValues = {},
  validate = () => ({}),
  onSubmit = () => {},
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldErrors = validate(values);
    setErrors(fieldErrors);
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(values);
    }
  };

  const setFieldValue = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const setFieldError = (name, error) =>
    setErrors((prev) => ({ ...prev, [name]: error }));

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setErrors,
    setValues,
    resetForm,
  };
}
