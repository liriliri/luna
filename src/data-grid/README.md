# Luna Data Grid

Grid for displaying datasets.

## Demo

https://luna.liriliri.io/?path=/story/data-grid

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-menu/luna-menu.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-data-grid/luna-data-grid.css" />
<script src="//cdn.jsdelivr.net/npm/luna-menu/luna-menu.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-data-grid/luna-data-grid.js"></script>
```

You can also get it on npm.

```bash
npm install luna-data-grid luna-menu --save
```

```javascript
import 'luna-menu/luna-menu.css'
import 'luna-data-grid/luna-data-grid.css'
import LunaDataGrid from 'luna-data-grid'
```

## Usage

```javascript
const dataGrid = new DataGrid(container, {
  columns: [
    {
      id: 'name',
      title: 'Name',
      sortable: true,
    },
    {
       id: 'site',
       title: 'Site',
     },
  ],
})

dataGrid.append({
  name: 'Runoob',
  site: 'www.runoob.com',
})
```

## Configuration

* columns(IColumn[]): Table columns.
* filter(string | RegExp | AnyFn): Data filter.
* headerContextMenu(boolean): Whether to show context menu on header.
* height(number): Table height.
* maxHeight(number): Max table height.
* minHeight(number): Min table height.
* selectable(boolean): Default selectable for all nodes.

## Api

### append(data: NodeData, options?: IDataGridNodeOptions): DataGridNode

Append row data.

### clear(): void

Clear all data.

### fit(): void

Fit height to the containing element.

### remove(node: DataGridNode): void

Remove row data.

### setData(data: NodeData | [], uniqueId?: string): void

Set data.

## Types

### IColumn

* comparator(AnyFn): Column sort comparator if sortable is true.
* id(string): Column id.
* sortable(boolean): Is column sortable.
* title(string): Column display name.
* visible(boolean): Is column initially visible.
* weight(number): Column weight.

### IDataGridNodeOptions

* selectable(boolean): Whether the node is selectable.
