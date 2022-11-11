import '@pages/popup/Popup.css';
import { Formik, Form, Field, FieldArray } from 'formik';
import { useEffect, useState } from 'react';
import { HiXMark } from 'react-icons/hi2';

type localStorageValuesProps = {
  colors: string[];
  errorColor: string;
  tabmixColor: string;
};

const defaultInitialValues: localStorageValuesProps = {
  colors: [
    'rgba(255,255,64,0.07)',
    'rgba(127,255,127,0.07)',
    'rgba(255,127,255,0.07)',
    'rgba(79,236,236,0.07)',
  ],
  errorColor: 'rgba(128,32,32,0.6)',
  tabmixColor: 'rgba(128,32,96,0.6)',
};

const Popup = () => {
  const [initialValues, setInitialValues] = useState<localStorageValuesProps>();

  useEffect(() => {
    if (chrome.storage === undefined) {
      setInitialValues(defaultInitialValues);
      return;
    }

    chrome.storage.local
      .get(['colors', 'errorColor', 'tabmixColor'])
      .then(({ colors, errorColor, tabmixColor }) =>
        setInitialValues({
          colors: colors ? JSON.parse(colors) : defaultInitialValues.colors,
          errorColor: errorColor || defaultInitialValues.errorColor,
          tabmixColor: tabmixColor || defaultInitialValues.tabmixColor,
        })
      );
  }, []);

  return (
    <div className="App">
      {initialValues && (
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => {
            chrome.storage?.local?.set({
              ...values,
              colors: JSON.stringify(values.colors),
            });
          }}
        >
          {({ values }) => (
            <Form>
              <div style={{ marginBottom: '32px' }}>
                <div
                  style={{
                    fontWeight: '600',
                  }}
                >
                  Colors
                </div>
                <div style={{ marginBottom: '8px' }}>
                  An array with color (hex, rgba, rgb) strings which are used as
                  colors, can be any length.
                </div>
                <FieldArray name="colors">
                  {({ remove, push }) => (
                    <div>
                      {values.colors.length > 0 &&
                        values.colors.map((_, index) => (
                          <div
                            className="row"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              marginBottom: '8px',
                            }}
                            key={index}
                          >
                            <div
                              className="col"
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
                              <Field
                                name={`colors.${index}`}
                                type="text"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  color: 'rgb(246, 246, 244)',
                                }}
                              />
                            </div>
                            <button type="button" onClick={() => remove(index)}>
                              <HiXMark color="rgb(246, 246, 244)" />
                            </button>
                          </div>
                        ))}
                      <button
                        type="button"
                        onClick={() => push('')}
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
                        Add
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <div
                  style={{
                    fontWeight: '600',
                  }}
                >
                  Error Color
                </div>
                <div style={{ marginBottom: '8px' }}>
                  Indent color for when there is an error in the indentation,
                  for example if you have your tabs set to 2 spaces but the
                  indent is 3 spaces. Can be any type of web based color format
                  (hex, rgba, rgb).
                </div>
                <div
                  className="col"
                  style={{
                    marginBottom: '8px',
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
                  <Field
                    name="errorColor"
                    type="text"
                    style={{
                      width: '100%',
                      height: '100%',
                      color: 'rgb(246, 246, 244)',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <div
                  style={{
                    fontWeight: '600',
                  }}
                >
                  Tabmix Color
                </div>
                <div style={{ marginBottom: '8px' }}>
                  Indent color for when there is a mix between spaces and tabs
                  in the indentation. Can be any type of web based color format
                  (hex, rgba, rgb) or a empty string(to be disabled this
                  coloring).
                </div>
                <div
                  className="col"
                  style={{
                    marginBottom: '8px',
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
                  <Field
                    name="tabmixColor"
                    type="text"
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
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default Popup;
