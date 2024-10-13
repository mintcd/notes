import Latex from "@components/atoms/latex";
import { TextField } from "@components/atoms"

export default function TextCell({
  itemId,
  attr,
  value,
  onUpdate,
}: {
  itemId: number;
  attr: AttrProps;
  value: string;
  onUpdate: (items: UpdatedItem) => void;
  focused?: boolean;
}) {
  function handleUpdate(value: string) {
    onUpdate({
      id: itemId,
      attrValue: { [attr.name]: value }
    })
  }

  return (
    <TextField
      value={String(value)}
      onUpdate={handleUpdate}
      type={attr.useLatex ? 'latex' : 'text'}
      preview={(value: string, selection: [number, number]) => <Latex>{String(value)}</Latex>}
      render={(value) => <Latex>{value}</Latex>}
    />
  );
}