import axios from 'axios';
import { useState, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// import { log } from 'console';

interface FormData {
  selectedOption: string;
  inputValue: string;
  dynamicFields: string[];
}
interface Category {
  id: number;
  name: string;
}
interface supplier {
  id: number;
  name: string;
  supplier_id:number;
  supplier_name:string;
}
const FormElements = () => {
  const [productId, setProductId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [, setEditorContent] = useState('');
  const [submittedData, setSubmittedData] = useState<{
    [key: string]: string[];
  }>({});
  const [, setUniqueValuesSet] = useState<Set<string>>(new Set());
  const [, setDropdownVisible] = useState<boolean>(true);
  const [tableInputValues, setTableInputValues] = useState<
    Array<{ [key: string]: string }>
  >([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<supplier[]>([]);

  const [formData, setFormData] = useState<FormData>({
    selectedOption: '',
    inputValue: '',
    dynamicFields: [],
  });

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      selectedOption: e.target.value,
      inputValue: '',
      dynamicFields: [],
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      inputValue: e.target.value,
    }));
    if (e.target.value.trim() !== '') {
      if (
        formData.dynamicFields.length === 0 ||
        formData.dynamicFields.slice(-1)[0].trim() !== ''
      ) {
        setFormData((prevData) => ({
          ...prevData,
          dynamicFields: [...prevData.dynamicFields, ''],
        }));
      }
    }
  };

  const handleDynamicFieldChange = (index: number, value: string) => {
    const updatedFields = [...formData.dynamicFields];
    if (value.trim() === '') {
      if (updatedFields.length > 1) {
        updatedFields.splice(index, 1);
      }
    } else {
      updatedFields[index] = value;
      if (value.length === 1 && index === updatedFields.length - 1) {
        updatedFields.push('');
      }
    }

    setFormData({
      ...formData,
      dynamicFields: updatedFields,
    });
  };

  const handleTableInputChange = (
    outerIndex: number,
    property: string,
    value: string,
  ) => {
    const updatedInputValues = [...tableInputValues];
    updatedInputValues[outerIndex] = { ...updatedInputValues[outerIndex] };
    updatedInputValues[outerIndex][property] = value;
    setTableInputValues(updatedInputValues);
    console.log('Table Input Values:', tableInputValues);
  };

  const handleSubmit = () => {
    const { selectedOption, inputValue, dynamicFields } = formData;
    const isDuplicateInForm = (dynamicFields || []).includes(inputValue);
    const isDuplicateInSubmittedData = (
      submittedData[selectedOption] || []
    ).includes(inputValue);
    const nonEmptyDynamicFields = dynamicFields.filter(
      (field) => field.trim() !== '',
    );
    if (isDuplicateInForm || isDuplicateInSubmittedData) {
      console.log(`Duplicate value for ${selectedOption}: ${inputValue}`);
    } else {
      setSubmittedData((prevData) => ({
        ...prevData,
        [selectedOption]: [
          ...(prevData[selectedOption] || []),
          inputValue,
          ...nonEmptyDynamicFields,
        ],
      }));
      setUniqueValuesSet(
        (prevValues) =>
          new Set([...prevValues, inputValue, ...nonEmptyDynamicFields]),
      );
      setDropdownVisible(false);
      setTableInputValues([]);
    }
  };

  const handleEditorReady = (editor: any) => {
    console.log(editor);
  };
  const handleEditorChange = (_: any, editor: any) => {
    const content = editor.getData();
    setEditorContent(content);
  };

  const [value, setvalues] = useState({
    name: '',
    description: '',
    price: '',
    weight: '',
    manufacturer:'',
    rating: 5,
    tag: [] as string[],
    quantityInStock: '',
    sku: '',
    category_id: '',
    supplier_id: '',
    categoryName: '',
    productId: '',
    status: '',
  });
  console.log(value);


 
 
 
 
  const handleFormSubmit = async () => {
    handleSubmitImage();
    try {
      const variantsData = Object.entries(submittedData).map(
        ([option, values], index) => {
          const tableInput = tableInputValues[index];

  
          return {
            key: option,
            values: values,
            type: tableInput?.type || undefined,
            weight: tableInput?.weight || undefined,
            unit: tableInput?.unit || undefined,
            availableQuantity: tableInput?.availableQuantity || undefined,
            variantPrice: tableInput?.variantPrice || undefined,
            variantSku: tableInput?.variantSku || "",
            optionValues: values.map((name, id) => {
              return {
                id: id.toString(),
                name: name,
                variantSku: [`${value.sku}-${name.toLowerCase()}`],
              };
            }),
          };
        }
      );
  
      // Prepare the full request data
      const requestData = {
        products: value,
        variants: variantsData,
      };
      const response = await axios.post(
        'http://localhost:5001/api/products/',
        requestData
      );
      console.log('Product and Variants created:', response.data);
      setTableInputValues([]);
      setSubmittedData({});
      setvalues({
        name: '',
        description: '',
        price: '',
        weight: '',
        rating: 5,
        manufacturer:"china",
        tag: [],
        quantityInStock: '',
        sku: '',
        category_id: '',
        supplier_id: '',
        categoryName: '',
        productId: '',
        status: '',
      });

      setFormData({
        selectedOption: '',
        inputValue: '',
        dynamicFields: [],
      });
  
    } catch (error) {
      console.error('Error creating product and variants:', error);
    }
  };
  

  const handleSubmitImage = async () => {
    if (!productId) {
      console.error('Product ID is required.');
      return;
    }

    const formData = new FormData();
    formData.append('productId', productId);

    if (imageFile) {
      formData.append('images', imageFile);
    } else {
      console.error('Image file is required.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/productImages', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Image posted successfully:', result);
    } catch (error) {
      console.error('Error posting image:', error);
    }
  };

  const handleProductIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductId(e.target.value);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0] as File);
    }
  };

  //categoriesAPI//

  useEffect(() => {
    fetch('http://localhost:5001/api/categories/all')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setCategoryList(data);
      })
      .catch((error) => {
        console.error('Fetch Error:', error);
      });
  }, []);
  //Vendor/

  useEffect(() => {
    fetch('http://localhost:5001/api/suppliers/all')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setSuppliers(data);
      })
      .catch((error) => {
        console.error('Fetch Error:', error);
      });
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[2fr,1fr]">
        <div className="flex flex-col gap-9">
          <div className="rounded-xl border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-5">
            <label className="ml-5 font-bold">Title</label>

            <div className="ml-5">
              <input
                type="text"
                placeholder="name"
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-1
                    px-5 font-medium outline-none transition focus:border-primary active:border-primary 
                   disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark 
                   dark:bg-form-input dark:focus:border-primary"
                onChange={(e) => setvalues({ ...value, name: e.target.value })}
                value={value.name}
              />
            </div>
            <br />
            <div className="ml-5 font-bold">
              <label htmlFor="">Desccription</label>
              <CKEditor
                editor={ClassicEditor}
                config={
                  {
                    /* Your CKEditor config options here */
                  }
                }
                onReady={handleEditorReady}
                onChange={handleEditorChange}
                

              />
            </div>
          </div>
          <div className="flex flex-col gap-9 ">
            <div className="rounded-xl border-stroke  bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-10">
              <div>
                <input
                  type="text"
                  placeholder="ProductId"
                  value={productId}
                  onChange={handleProductIdChange}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-1
                  px-5 font-medium outline-none transition focus:border-primary active:border-primary 
                 disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark 
                 dark:bg-form-input dark:focus:border-primary"
                />
              </div>
              <br />
              <br />
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <input
                      type="file"
                      onChange={handleImageFileChange}
                      className="w-30 cursor-pointer rounded-lg border-[1.5px] border-stroke
                   bg-transparent font-medium outline-none transition file:mr-5 file:border-collapse
                   file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke
                    file:bg-whiter file:py-1 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10
                    focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter
                     dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark
                     dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                    />

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      SVG, PNG, JPG
                    </p>
                  </div>
                  <input id="dropzone-file" type="file" className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-9 ">
            <div className="rounded-xl border-stroke  bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5.5 p-6.5">
                <div>
                  <label className="font-bold" htmlFor="">
                    Price
                  </label>
                  <br />
                  <input
                    type="text"
                    placeholder="RS 0.00"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent
                    px-5 font-medium outline-none transition focus:border-primary active:border-primary
                   disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark
                   dark:bg-form-input dark:focus:border-primary"
                    onChange={(e) =>
                      setvalues({ ...value, price: e.target.value })
                    }
                    value={value.price}
                  />
                </div>
                <div>
                  <label className="font-bold" htmlFor="">
                    Compare-at price
                  </label>
                  <br />

                  <input
                    type="text"
                    placeholder=" Rs 0.00"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent
                   px-5 font-medium outline-none transition focus:border-primary active:border-primary
                  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input
                   dark:focus:border-primary"
                    //      onChange={(e)=>setvalues({...value, categoryName: e.target.value})}
                    //      value={value. categoryName}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5.5 p-6.5">
                <div>
                  <label className="font-bold" htmlFor="">
                    Cost per item
                  </label>
                  <br />
                  <input
                    type="text"
                    placeholder="RS 0.00"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent
                    px-5 font-medium outline-none transition focus:border-primary active:border-primary
                   disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark
                   dark:bg-form-input dark:focus:border-primary"
                    //  onChange={(e)=>setvalues({...value,name: e.target.value})}
                    //  value={value.name}
                  />
                </div>
                <div>
                  <label className="font-bold" htmlFor="">
                    Profit
                  </label>
                  <br />

                  <input
                    type="text"
                    placeholder="--"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent 
                   px-5 font-medium outline-none transition focus:border-primary active:border-primary
                  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input
                   dark:focus:border-primary"
                    //      onChange={(e)=>setvalues({...value, categoryName: e.target.value})}
                    //      value={value. categoryName}
                  />
                </div>
                <div>
                  <label className="font-bold" htmlFor="">
                    Margin
                  </label>
                  <input
                    type="text"
                    placeholder="--"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent
                   px-5 font-medium outline-none transition focus:border-primary active:border-primary
                  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input
                   dark:focus:border-primary"
                    //      onChange={(e)=>setvalues({...value, categoryName: e.target.value})}
                    //      value={value. categoryName}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-9 ">
            <div className="rounded-xl border-stroke  bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-5">
              <div className="ml-5">
                <h1 className="font-bold">Inventory</h1>
                <br />
                <div className="flex">
                  <input type="checkbox" className="w-4" />
                  <p className="ml-2 font-bold">Track quantity</p>
                </div>
                <br />

                <h2 className="font-bold">Quantity</h2>
                <hr />
                <br />

                <div className="flex justify-between">
                  <div>
                    <h1 className="text-lg">Shop location</h1>
                  </div>

                  <div>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-30 rounded-lg border-[1.5px] border-stroke bg-transparent 
                   px-5 font-medium outline-none transition focus:border-primary active:border-primary
                  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input
                   dark:focus:border-primary"
                      onChange={(e) =>
                        setvalues({ ...value, name: e.target.value })
                      }
                      value={value.name}
                    />
                  </div>
                </div>
                <br />

                <br />
                <div className="flex">
                  <input type="checkbox" className="w-4" />
                  <h3 className="ml-2">This product has a SKU or barcode</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="rounded-xl border-stroke  bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-5">
              <h1 className="font-bold">Variants</h1>
              <hr />
              <div className="mt-5 border-bodydark border-opacity-20 border-4 p-5">
                <h1>Option name</h1>
                <select
                  style={{ background: 'lightgray' }}
                  id="dropdown"
                  value={formData.selectedOption}
                  onChange={handleDropdownChange}
                  className="w-80 rounded-lg border-[1.5px] border-stroke bg-transparent py-1 mr-4
        px-5  bg-black font-medium outline-none transition focus:border-primary active:border-primary 
        disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input
        dark:focus:border-primary"
                >
                  <option value="color">select-</option>
                  <option value="color">Color</option>
                  <option value="size">Size</option>
                  {/* Add more options as needed */}
                </select>
                <br />
                <br />

                {formData.selectedOption === 'color' ||
                formData.selectedOption === 'size' ? (
                  <div>
                    <h1 className="font-bold">Option Value</h1>
                    <input
                      style={{ background: 'lightgray' }}
                      type="text"
                      className="w-80 rounded-lg border-[1.5px] border-stroke bg-transparent py-1 mr-4
            px-3 font-medium outline-none transition focus:border-primary active:border-primary 
            disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input
            dark:focus:border-primary"
                      id="valueInput"
                      name="value"
                      value={formData.inputValue}
                      onChange={handleInputChange}
                    />
                  </div>
                ) : null}

                {formData.dynamicFields.map((field, index) => (
                  <div key={index}>
                    <input
                      style={{ background: 'lightgray' }}
                      type="text"
                      placeholder="Add another value"
                      className="w-80 rounded-lg border-[1.5px] border-stroke bg-transparent py-1 mr-4
            px-5 font-medium outline-none transition focus:border-primary active:border-primary 
            disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input
            dark:focus:border-primary"
                      value={field}
                      onChange={(e) =>
                        handleDynamicFieldChange(index, e.target.value)
                      }
                    />
                  </div>
                ))}
                <br />
                <br />

                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md
        bg-black p-1  text-center font-medium text-white hover:bg-opacity-90 "
                  onClick={handleSubmit}
                >
                  Done
                </button>
                <br />
                <br />
              </div>

              <div className="Parent ">
                <div className="table mt-5">
                  {Object.keys(submittedData).length > 0 && (
                    <div>
                      <table>
                        <thead>
                          <tr>
                            {/* <th className="border font-bold border-stroke p-2">
            key
          </th> */}
                            <th className="border font-bold border-stroke p-2">
                              values
                            </th>
                            <th className="border font-bold border-stroke p-2">
                              Type
                            </th>
                            <th className="border font-bold border-stroke p-2">
                              Weight
                            </th>
                            <th className="border font-bold border-stroke p-2">
                              Unit
                            </th>
                            <th className="border font-bold border-stroke p-2">
                              AvailableQuantity
                            </th>

                            <th className="border font-bold border-stroke p-2">
                              VarientPrice
                            </th>
                            <th className="border font-bold border-stroke p-2">
                              VariantSku
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(submittedData).map(
                            ([_, values], index) =>
                              values.map((value, innerIndex) => (
                                <tr key={`${index}-${innerIndex}`}>
                                  <td className="border font-bold border-stroke p-2">
                                    {value}
                                  </td>
                                  <td className="border font-bold border-stroke p-2">
                                    <input
                                      type="text"
                                      placeholder="type"
                                      className="w-full min-w-30 rounded-lg border-[1.5px] border-stroke bg-transparent px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      onChange={(e) =>
                                        handleTableInputChange(
                                          innerIndex,
                                          'type',
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </td>
                                  <td className="border font-bold border-stroke p-2">
                                    <input
                                      type="number"
                                      placeholder="0.0"
                                      className="w-full min-w-20 rounded-lg border-[1.5px] border-stroke bg-transparent px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      onChange={(e) =>
                                        handleTableInputChange(
                                          innerIndex,
                                          'weight',
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </td>
                                  <td className="border font-bold border-stroke p-2">
                                    <input
                                      type="text"
                                      placeholder="Kg"
                                      className="w-full min-w-20 rounded-lg border-[1.5px] border-stroke bg-transparent px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      onChange={(e) =>
                                        handleTableInputChange(
                                          innerIndex,
                                          'unit',
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </td>
                                  <td className="border font-bold border-stroke p-2">
                                    <input
                                      type="number"
                                      placeholder="0.0"
                                      className="w-full min-w-20 rounded-lg border-[1.5px] border-stroke bg-transparent px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      onChange={(e) =>
                                        handleTableInputChange(
                                          innerIndex,
                                          'availableQuantity',
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </td>
                                  <td className="border font-bold border-stroke p-2">
                                    <input
                                      type="number"
                                      placeholder="0.0"
                                      className="w-full min-w-20 rounded-lg border-[1.5px] border-stroke bg-transparent px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      onChange={(e) =>
                                        handleTableInputChange(
                                          innerIndex,
                                          'variantPrice',
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </td>
                                  <td className="border font-bold border-stroke p-2">
                                    <input
                                      type="text"
                                      placeholder="sku"
                                      className="w-full min-w-20 rounded-lg border-[1.5px] border-stroke bg-transparent px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      onChange={(e) =>
                                        handleTableInputChange(
                                          innerIndex,
                                          'variantSku',
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </td>
                                </tr>
                              )),
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* //////////////////////////////////////second column/////////////////////////////////////////////////////////////////////////////////////////// */}
        <div className="flex flex-col gap-9 ">
          <div className="rounded-xl border-stroke bg-white text-black shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="p-5">
              <select
                onChange={(e) =>
                  setvalues({ ...value, status: e.target.value })
                }
                value={value.status}
                className="w-80 rounded-lg border-[1.5px] border-stroke bg-transparent py-1
             px-5 font-medium outline-none transition focus:border-primary active:border-primary 
            disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input
            dark:focus:border-primary"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-9 ">
            <div className="rounded-xl border-stroke  bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className=" ml-5 mt-3">
                <h1 className="font-semibold">Publishing</h1>
                <ul className="list-disc mx-5">
                  <li>Online Store</li>
                  <li>Point of Sale</li>
                  <p>
                    Point of Sale has not been set up. Finish the remaining
                    steps to start selling in person.
                  </p>
                  <a
                    href="#"
                    className="text-blue-500 underline hover:text-blue-700"
                  >
                    Learn more
                  </a>
                  <br />
                  <h2 className="font-semibold">Market</h2>
                  <li>Incomplete International and Pakistan</li>
                </ul>
                <br />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-9 ">
            <div className="rounded-xl border-stroke  bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-2">
              <div className="ml-5">
                <h1 className="font-semibold">Product organization</h1>
                <br />
                <label className="font-bold" htmlFor="">
                  Product Category
                </label>
                <select
                  onChange={(e) => {
                    const selectedCategory = categoryList.find(
                      (category) => category.id === parseInt(e.target.value),
                    );
                    if (selectedCategory) {
                      setvalues({
                        ...value,
                        category_id: String(selectedCategory.id),
                        categoryName: selectedCategory.name,
                      });
                    }
                  }}
                  value={value.category_id}
                  className="w-80 rounded-lg border-[1.5px] border-stroke bg-transparent py-1 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                >
                  {categoryList.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <br />
                <br />
                <label className="font-bold" htmlFor="">
                  QuantityInStock
                </label>

                <input
                  type="text"
                  placeholder="quantityInStock"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-1
                    px-2 font-medium outline-none transition focus:border-primary active:border-primary 
                   disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark 
                   dark:bg-form-input dark:focus:border-primary"
                  onChange={(e) =>
                    setvalues({ ...value, quantityInStock: e.target.value })
                  }
                  value={value.quantityInStock}
                />
                <br />
                <br />
                <label className="font-bold" htmlFor="">
                  Vendor
                </label>
                {/* <select
  onChange={(e) => console.log('Selected Supplier:', e.target.value)}
  className="w-80 rounded-lg border-[1.5px] border-stroke bg-transparent py-1 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
>
  <option value="">Selected Vendor</option>
  {suppliers.map(supplier => (
    <option key={supplier.id} value={supplier.supplier_id}>{supplier.supplier_id}</option>
  ))}
</select> */}
<select
  onChange={(e) => {
    const selectedSupplier = suppliers.find(
      (supplier) => supplier.supplier_id === parseInt(e.target.value)
    );
    if (selectedSupplier) {
      setvalues({
        ...value,
        supplier_id: String(selectedSupplier.supplier_id),
      
      });
    }
  }}
  value={value.supplier_id} 
  className="w-80 rounded-lg border-[1.5px] border-stroke bg-transparent py-1 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
>
  <option value="">Selected Vendor</option>
  {suppliers.map((supplier) => (
    <option key={supplier.id} value={supplier.supplier_id}>
      {supplier.supplier_name}
    </option>
  ))}
</select>

                {/* <input
                  type="text"
                  placeholder="Supplier_id"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-1
                    px-2 font-medium outline-none transition focus:border-primary active:border-primary 
                   disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark 
                   dark:bg-form-input dark:focus:border-primary"
                  onChange={(e) =>
                    setvalues({ ...value, supplier_id: e.target.value })
                  }
                  value={value.supplier_id}
                /> */}
                <br />
                <br />
                <label className="font-bold" htmlFor="">
                  SKU
                </label>

                <input
                  type="text"
                  placeholder="Sku"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-1
                    px-2 font-medium outline-none transition focus:border-primary active:border-primary 
                   disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark 
                   dark:bg-form-input dark:focus:border-primary"
                  onChange={(e) => setvalues({ ...value, sku: e.target.value })}
                  value={value.sku}
                />
                <br />
                <br />
                <label className="font-bold" htmlFor="">
                  Tags
                </label>

                <input
                  type="text"
                  placeholder="Tags"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-1
                    px-2 font-medium outline-none transition focus:border-primary active:border-primary 
                   disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark 
                   dark:bg-form-input dark:focus:border-primary"
                  onChange={(e) =>
                    setvalues({ ...value, tag: [e.target.value] })
                  }
                  value={value.tag.join(',')}
                />
                <br />
                <br />
              </div>
            </div>
          </div>
        </div>
        <div></div>
        <div
          style={{ border: '20px', padding: '10px' }}
          className="flex justify-end"
        >
          <button
            className="inline-flex items-center justify-center rounded-md bg-primary py-4 px-10 text-center
              font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
            onClick={handleFormSubmit}
          >
            Submite
          </button>
        </div>
      </div>
    </>
  );
};
export default FormElements;
