import { FormField } from "@/components/builder/types";

const firstNames = ["John", "Jane", "Alex", "Emily", "Chris", "Katie"];
const lastNames = ["Smith", "Doe", "Johnson", "Williams", "Brown", "Davis"];
const domains = ["example.com", "test.org", "demo.net", "me.io"];

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

export const generateMockData = (
  fields: FormField[]
): Record<string, any> => {
  const mockData: Record<string, any> = {};

  fields.forEach((field) => {
    switch (field.type) {
      case "text":
        mockData[field.id] = `${getRandom(firstNames)} ${getRandom(lastNames)}`;
        break;
      case "email":
        mockData[
          field.id
        ] = `${getRandom(firstNames).toLowerCase()}@${getRandom(domains)}`;
        break;
      case "phone":
        mockData[
          field.id
        ] = `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(
          1000 + Math.random() * 9000
        )}`;
        break;
      case "number":
        mockData[field.id] = Math.floor(Math.random() * 1000);
        break;
      case "url":
        mockData[field.id] = `https://www.${getRandom(domains)}`;
        break;
      case "textarea":
        mockData[field.id] =
          "This is a sample message for testing purposes. It is automatically generated to fill the textarea with relevant content.";
        break;
      case "select":
      case "radio":
        mockData[field.id] =
          field.options && field.options.length > 0
            ? getRandom(field.options)
            : "";
        break;
      case "checkbox":
        mockData[field.id] =
          field.options && field.options.length > 0
            ? [getRandom(field.options)]
            : [];
        break;
      case "date":
        mockData[field.id] = new Date().toISOString().split("T")[0];
        break;
      case "switch":
        mockData[field.id] = Math.random() > 0.5;
        break;
      case "rating":
        mockData[field.id] = Math.floor(
          1 + Math.random() * (field.ratingConfig?.scale || 5)
        );
        break;
      // Address and other complex fields can be expanded
      default:
        mockData[field.id] = "";
    }
  });

  return mockData;
};
