import {
  faCircleNotch,
  faWarning,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

type ModalInputs = {
  [id: string]: {
    label: string;
    type: React.HTMLInputTypeAttribute | 'select';
    value: string | boolean;
    options?: { id: string; label: string }[];
  };
};

export type ModalParams = {
  show: boolean;
  title: string;
  message: string;
  inputs?: ModalInputs;
  buttonText: string;
  buttonAction: (inputs?: ModalInputs) => void;
};

export type LoaderParams = {
  show: boolean;
  error: string;
};

export default function AdminModal({
  setModal,
  modal,
  loader,
}: {
  setModal: React.Dispatch<React.SetStateAction<ModalParams | undefined>>;
  modal?: ModalParams;
  loader?: LoaderParams;
}) {
  console.log(modal);
  return (
    (modal?.show || loader?.show || loader?.error) && (
      <div
        className="w-screen h-screen fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={(e) =>
          e.target === e.currentTarget ? setModal(undefined) : null
        }
      >
        {loader?.error ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="max-w-3xl text-center">
              <div className="text-5xl">
                <FontAwesomeIcon icon={faWarning} />
              </div>
              <div className="text-xl font-bold mt-4">{loader.error}</div>
              <div className="text-lg mt-2">
                Something might be messed up. Contact Thijs for support!
              </div>
            </div>
          </div>
        ) : loader?.show ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="max-w-3xl text-center">
              <div className="text-5xl">
                <FontAwesomeIcon
                  icon={faCircleNotch}
                  className="animate-spin"
                />
              </div>
              <div className="text-lg mt-4">
                This should only take a sec. Reload if this gets stuck.
              </div>
            </div>
          </div>
        ) : modal?.show ? (
          <div
            className="sm:mx-4 h-full"
            onClick={(e) =>
              e.target === e.currentTarget ? setModal(undefined) : null
            }
          >
            <div className="max-w-3xl w-full bg-black/90 mx-auto sm:mt-56 h-full sm:h-auto">
              <div className="w-full bg-red-500/30 p-6 relative h-full sm:h-auto">
                <div className="top-4 right-6 absolute text-xl">
                  <button onClick={() => setModal(undefined)}>
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
                <div className="text-xl font-bold">{modal.title}</div>
                <div className="bg-black/40 p-4 mt-4">
                  <div className="">{modal.message}</div>
                </div>
                <div className="mt-4 mb-2">
                  {Object.keys(modal.inputs || {}).length
                    ? Object.entries(modal.inputs || {}).map(([id, input]) => (
                        <div key={id} className="mt-2">
                          {input.type !== 'checkbox' ? (
                            <label className="w-full" htmlFor={id}>
                              {input.label}:{' '}
                            </label>
                          ) : null}
                          {input.type === 'select' ? (
                            <select
                              className="bg-black/40 text-white p-1"
                              value={
                                typeof input.value === 'string'
                                  ? input.value
                                  : undefined
                              }
                              onChange={(e) =>
                                setModal((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        inputs: {
                                          ...prev.inputs,
                                          [id]: {
                                            ...input,
                                            value: e.target.value,
                                          },
                                        },
                                      }
                                    : undefined
                                )
                              }
                            >
                              {input.options?.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              id={id}
                              type={input.type}
                              value={
                                typeof input.value === 'string'
                                  ? input.value
                                  : undefined
                              }
                              checked={
                                typeof input.value === 'boolean'
                                  ? input.value
                                  : undefined
                              }
                              className=""
                              onChange={(e) =>
                                setModal((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        inputs: {
                                          ...prev.inputs,
                                          [id]: {
                                            ...input,
                                            value:
                                              e.target.checked ??
                                              e.target.value,
                                          },
                                        },
                                      }
                                    : undefined
                                )
                              }
                            />
                          )}
                          {input.type === 'checkbox' ? (
                            <label className="ml-2" htmlFor={id}>
                              {input.label}
                            </label>
                          ) : null}
                        </div>
                      ))
                    : null}
                </div>
                <div className="flex flex-row gap-4">
                  <button
                    className="bg-black/40 text-red-600 px-5 py-2 mt-2 hover:bg-black/20 transition border-2 border-red-600"
                    onClick={() => modal.buttonAction(modal.inputs)}
                  >
                    {modal.buttonText}
                  </button>
                  <button
                    className="bg-black/40 text-white px-5 py-2 mt-2 hover:bg-black/20 transition border-2 border-white"
                    onClick={() => setModal(undefined)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    )
  );
}
