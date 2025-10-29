import * as React from 'react';
import { Table as MuiTable, Radio } from '@mui/material';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableVirtuoso } from 'react-virtuoso';

import './Table.css'

export default function Table({ observations, customAttributeKeys, selectedObjectId, setSelectedObjectId }) {
    const columns = [
        {
            width: "2rem",
            label: 'Id',
            dataKey: 'id',
        },
        {
            width: "4rem",
            label: 'Type',
            dataKey: 'type',
        },
        {
            width: "4rem",
            label: 'Datetime',
            dataKey: 'datetime',
        }
    ];

    columns.push(...customAttributeKeys.map(customDataField => {
        return {
            width: "4rem",
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
        TableRow: React.forwardRef((props, ref) => <TableRow {...props} ref={ref} />),
        TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
    };

    const fixedHeaderContent = () => {
        return (
            <TableRow className='table-header'>
                {columns.map((column) => (
                    <TableCell
                        key={column.dataKey}
                        variant="head"
                        align={column.numeric || false ? 'right' : 'left'}
                        style={{ width: column.width }}
                    >
                        <b>{column.label}</b>
                    </TableCell>
                ))}
            </TableRow>
        );
    }

    const handleRowSelection = (id) => {
        if(selectedObjectId === id) {
            setSelectedObjectId(null);
        } else {
            setSelectedObjectId(id);
        }
    }

    const rowContent = (_index, row) => {
        const isSelected = selectedObjectId === row["id"];
        return columns.map((column) => (
                <TableCell
                    style={{
                        width: column.width,
                        overflow: "clip",
                        cursor: "pointer"
                    }}
                    key={column.dataKey}
                    align={column.numeric || false ? 'right' : 'left'}
                    onClick={() => handleRowSelection(row["id"])}
                    className={isSelected ? "selected": ""}
                    // sx={{
                    //     backgroundColor: isSelected ? 'rgba(0, 0, 255, 0.08)' : 'inherit'
                    // }}
                >
                    {row[column.dataKey]}
                </TableCell>
            ));
        
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