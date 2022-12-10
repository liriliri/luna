# Luna Data Grid

Grid for displaying datasets.

## Demo

https://luna.liriliri.io/?path=/story/data-grid

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-data-grid/luna-data-grid.css" />
<script src="//cdn.jsdelivr.net/npm/luna-data-grid/luna-data-grid.js"></script>
```

You can also get it on npm.

```bash
npm install luna-data-grid --save
```

```javascript
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
* height(number): Table height.
* maxHeight(number): Max table height.
* minHeight(number): Min table height.

## Api

### append(data: PlainObj<string | HTMLElement>, options?: IDataGridNodeOptions): DataGridNode

Append row data.

### clear(): void

Clear all data.

### remove(node: DataGridNode): void

Remove row data.

## Types

### IColumn

* comparator(AnyFn): Column sort comparator if sortable is true.
* id(string): Column id.
* sortable(boolean): Is column sortable.
* title(string): Column display name.
* weight(number): Column weight.

### IDataGridNodeOptions

* selectable(boolean): Whether the node is selectable.
