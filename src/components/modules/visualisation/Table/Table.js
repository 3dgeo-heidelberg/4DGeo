import * as React from 'react';
import { Table as MuiTable } from '@mui/material';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableVirtuoso } from 'react-virtuoso';

export default function Table({ observations, customAttributeKeys }) {
    const columns = [
        {
            width: "8rem",
            label: 'Id',
            dataKey: 'id',
        },
        {
            width: "8rem",
            label: 'Type',
            dataKey: 'type',
        },
        {
            width: "8rem",
            label: 'Datetime',
            dataKey: 'datetime',
        }
    ];

    columns.push(...customAttributeKeys.map(customDataField => {
        return {
            width: "8rem",
            label: customDataField,
            dataKey: customDataField
        }
    }))

    const rows = observations.map((observation) => observation.geoObjects.map(geoObject => {
        let id = geoObject.id;
        let data = {
            id,
            id: id,
            type: geoObject.type,
            datetime: geoObject.dateTime,
        }

        Object.entries(geoObject.customAttributes).forEach(([key, value]) => {
            data[key] = value
        });

        return data;
    })).flat();

    const VirtuosoTableComponents = {
        Scroller: React.forwardRef((props, ref) => (
            <TableContainer component={Paper} {...props} ref={ref} />
        )),
        Table: (props) => (
            <MuiTable {...props} size='small' sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />
        ),
        TableHead: React.forwardRef((props, ref) => <TableHead {...props} ref={ref} />),
        TableRow,
        TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
    };

    const fixedHeaderContent = () => {
        return (
            <TableRow>
                {columns.map((column) => (
                    <TableCell
                        key={column.dataKey}
                        variant="head"
                        align={column.numeric || false ? 'right' : 'left'}
                        style={{ width: column.width }}
                        sx={{ backgroundColor: 'background.paper' }}
                    >
                        {column.label}
                    </TableCell>
                ))}
            </TableRow>
        );
    }

    const rowContent = (_index, row) => {
        return (
            <React.Fragment>
                {columns.map((column) => (
                    <TableCell
                        key={column.dataKey}
                        align={column.numeric || false ? 'right' : 'left'}
                    >
                    {row[column.dataKey]}
                    </TableCell>
                ))}
            </React.Fragment>
        );
    }

    return (
        <Paper style={{ height: "100%", width: '100%' }}>
        <TableVirtuoso
            data={rows}
            components={VirtuosoTableComponents}
            fixedHeaderContent={fixedHeaderContent}
            itemContent={rowContent}
        />
        </Paper>
    );
}