/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, fireEvent, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { LanguagePicker, languagePickerStrings_en } from '..';

afterEach(cleanup);

const MyComponent: React.FC = (props: any) => {
  const [bcp47, setBcp47] = React.useState('und');
  const [lgName, setLgName] = React.useState('');
  const [fontName, setFontName] = React.useState('');

  return (
    <LanguagePicker
      value={bcp47}
      setCode={setBcp47}
      name={lgName}
      setName={setLgName}
      font={fontName}
      setFont={setFontName}
      t={languagePickerStrings_en}
    />
  );
};

test('can render Language Picker snapshot', async () => {
  const { getByText, container } = render(<MyComponent />);
  await waitFor(() => getByText(/^Language$/i));
  expect(container).toMatchSnapshot();
});

test('enter e', async () => {
  const { getByText, container } = render(<MyComponent />);
  await waitFor(() => getByText(/^Language$/i));
  fireEvent.keyDown(getByText(/^Language/i).nextSibling?.firstChild as any, {
    key: 'E',
    code: 'KeyE',
  });
  await waitFor(() => getByText(/^Choose Language Details$/i));
  expect(container.parentElement).toMatchSnapshot();
});

test('enter en contains en-001 entry', async () => {
  const { getByText, getAllByText, container } = render(<MyComponent />);
  await waitFor(() => getByText(/^Language$/i));
  fireEvent.keyDown(getByText(/^Language/i).nextSibling?.firstChild as any, {
    key: 'E',
    code: 'KeyE',
  });
  await waitFor(() => getByText(/^Choose Language Details$/i));
  fireEvent.change(
    getAllByText(/Find a language by name, code, or country/i)[0].nextSibling
      ?.firstChild as any,
    { target: { value: 'en' } }
  );
  await waitFor(() => getByText(/^en-001$/i));
  expect(
    getByText(/^en-001$/i).parentElement?.parentElement?.parentElement
      ?.parentElement
  ).toMatchSnapshot();
});

test('enter zh-CN-x-pyn looks up correct result', async () => {
  const dom = render(<MyComponent />);
  const { getByText, getAllByText, container } = dom;
  await waitFor(() => getByText(/^Language$/i));
  const langEl = getByText(/^Language/i).nextSibling?.firstChild as HTMLElement;
  // typing in this box opens the chooser
  fireEvent.keyDown(langEl, { key: 'z', code: 'KeyZ' });
  await waitFor(() => getByText(/^Choose Language Details$/i));
  const codeEl = getAllByText(/Find a language by name, code, or country/i)[0]
    .nextSibling?.firstChild as any;
  // We enter the code we want to test
  fireEvent.change(codeEl, { target: { value: 'zh-CN-x-pyn' } });
  await waitFor(() => getByText(/^zh-CN$/i));
  const lgEl =
    getByText(/^zh-CN$/i).parentElement?.parentElement?.parentElement
      ?.parentElement;
  expect(lgEl).toMatchSnapshot();
  // making a language choice should update the code value
  lgEl && fireEvent.click(lgEl);
  // when the Script choice appears - the calculation is complete
  await waitFor(() => getByText(/^Script$/));
  expect(codeEl).toHaveAttribute('value', '中文 / Chinese (zh-CN-x-pyn)');
});

test('enter zhn-fonapi looks up correct result', async () => {
  const dom = render(<MyComponent />);
  const { getByText, getAllByText, container } = dom;
  await waitFor(() => getByText(/^Language$/i));
  const langEl = getByText(/^Language/i).nextSibling?.firstChild as HTMLElement;
  // typing in this box opens the chooser
  fireEvent.keyDown(langEl, { key: 'z', code: 'KeyZ' });
  await waitFor(() => getByText(/^Choose Language Details$/i));
  const codeEl = getAllByText(/Find a language by name, code, or country/i)[0]
    .nextSibling?.firstChild as any;
  // We enter the code we want to test
  fireEvent.change(codeEl, { target: { value: 'zhn-fonapi' } });
  await waitFor(() => getByText(/^zhn-Latn$/i));
  const lgEl =
    getByText(/^zhn-Latn$/i).parentElement?.parentElement?.parentElement
      ?.parentElement;
  // making a language choice should update the code value
  lgEl && fireEvent.click(lgEl);
  // when the Script choice appears - the calculation is complete
  await waitFor(() => getByText(/^Script$/));
  expect(codeEl).toHaveAttribute('value', 'Zhuang, Nong (zhn-fonapi)');
});
