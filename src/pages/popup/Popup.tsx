import '@pages/popup/Popup.css';
import { Formik, Form, Field, useFormik } from 'formik';

const Popup = () => {
  const formik = useFormik({
    initialValues: {
      colors:
        'rgba(255,255,64,0.07), rgba(127,255,127,0.07), rgba(255,127,255,0.07), rgba(79,236,236,0.07)',
      errorColor: 'rgba(128,32,32,0.6)',
      tabmixColor: 'rgba(128,32,96,0.6)',
    },
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });
  return (
    <div className="App">
      <form onSubmit={formik.handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontWeight: '600',
            }}
          >
            Colors
          </div>
          <div>
            An array with color (hex, rgba, rgb) strings which are used as
            colors, can be any length.
          </div>

          <div
            style={{
              backgroundColor: 'rgb(38, 38, 38)',
              color: 'rgb(246, 246, 244)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'rgb(25, 26, 33)',
              width: '400px',
              height: '24px',
              boxSizing: 'border-box',
            }}
          >
            <input
              id="colors"
              name="colors"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.colors}
              style={{
                width: '100%',
                height: '100%',
                color: 'rgb(246, 246, 244)',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontWeight: '600',
            }}
          >
            Error Color
          </div>
          <div>
            Indent color for when there is an error in the indentation, for
            example if you have your tabs set to 2 spaces but the indent is 3
            spaces. Can be any type of web based color format (hex, rgba, rgb).
          </div>

          <div
            style={{
              backgroundColor: 'rgb(38, 38, 38)',
              color: 'rgb(246, 246, 244)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'rgb(25, 26, 33)',
              width: '200px',
              height: '24px',
              boxSizing: 'border-box',
            }}
          >
            <input
              id="errorColor"
              name="errorColor"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.errorColor}
              style={{
                width: '100%',
                height: '100%',
                color: 'rgb(246, 246, 244)',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontWeight: '600',
            }}
          >
            Tabmix Color
          </div>
          <div>
            Indent color for when there is a mix between spaces and tabs in the
            indentation. Can be any type of web based color format (hex, rgba,
            rgb) or a empty string(to be disabled this coloring).
          </div>

          <div
            style={{
              backgroundColor: 'rgb(38, 38, 38)',
              color: 'rgb(246, 246, 244)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'rgb(25, 26, 33)',
              width: '200px',
              height: '24px',
              boxSizing: 'border-box',
            }}
          >
            <input
              id="tabmixColor"
              name="tabmixColor"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.tabmixColor}
              style={{
                width: '100%',
                height: '100%',
                color: 'rgb(246, 246, 244)',
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            color: 'rgb(246, 246, 244)',
            backgroundColor: 'rgb(68, 71, 90)',
            maxWidth: '300px',
            boxSizing: 'border-box',
            display: 'flex',
            padding: '4px',
            borderRadius: '2px',
            textAlign: 'center',
            cursor: 'pointer',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100px',
            height: '26px',
          }}
        >
          Save
        </button>
      </form>
    </div>
  );

  // return (
  //   <div className="App">
  //     <Formik
  //       initialValues={{ color: '' }}
  //       onSubmit={(values, { setSubmitting }) => {
  //         setTimeout(() => {
  //           alert(JSON.stringify(values, null, 2));
  //           setSubmitting(false);
  //         }, 400);
  //       }}
  //     >
  // {
  /* {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <div
              style={{
                fontWeight: '600',
              }}
            >
              Colors
            </div>
            <div>
              An array with color (hex, rgba, rgb) strings which are used as
              colors, can be any length.
            </div>

            <div>
              <input
                type="text"
                name="color"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.color}
                style={{
                  backgroundColor: 'rgb(38, 38, 38)',
                  color: 'rgb(246, 246, 244)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgb(25, 26, 33)',
                }}
              />
            </div>

            <button type="submit" disabled={isSubmitting}>
              Save
            </button>
          </form>
        )} */
  // }
  //     </Formik>
  //   </div>
  // );
};

export default Popup;
