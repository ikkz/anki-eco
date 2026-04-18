import { Block } from '@/components/block';
import { Button } from '@/components/button';
import { ToolEdit } from '@/features/tools/edit';
import { useNavigate, Page } from '@/hooks/use-page';
import { Tool, toolsAtom } from '@/store/tools';
import * as t from 'at/i18n';
import { useAtom } from 'jotai/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default () => {
  const navigate = useNavigate();
  const [tools, setTools] = useAtom(toolsAtom);
  const [edit, setEdit] = useState<Tool | null>(null);

  const onSave = (tool: Tool) => {
    const { id } = tool;
    setTools((prevTools) => {
      const idx = prevTools.findIndex((item) => item.id === id);
      if (idx < 0) {
        prevTools.push(tool);
      } else {
        prevTools[idx] = { ...tool };
      }
      return prevTools.slice();
    });
    setEdit(null);
  };

  const onDelete = (tool: Tool) => {
    if (!confirm(t.confirmDelete)) {
      return;
    }
    setTools((prevTools) => {
      return prevTools.filter((item) => item.id !== tool.id);
    });
  };

  const onAdd = () => {
    setEdit({
      id: Math.random().toString(36).slice(2),
    });
  };

  return (
    <>
      <Block
        name={t.tool}
        action={<Button onClick={() => navigate(Page.Settings)}>{t.back}</Button>}
      >
        {edit ? (
          <ToolEdit initialTool={edit} onSave={onSave} onCancel={() => setEdit(null)} />
        ) : (
          <div className="space-y-1">
            <Button onClick={onAdd}>{t.add}</Button>
            {tools.map((tool) => (
              <div key={tool.id} className="flex items-center justify-between">
                <div>{tool.name}</div>
                <div className="space-x-2 flex items-center">
                  <Button onClick={() => setEdit(tool)}>
                    <Pencil size={17} className="m-1" />
                  </Button>
                  <Button status="danger" onClick={() => onDelete(tool)}>
                    <Trash2 size={17} className="m-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Block>
      <Block name={t.help}>
        <div
          className="prose prose-sm prose-neutral dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: t.toolHelp }}
        />
      </Block>
    </>
  );
};
