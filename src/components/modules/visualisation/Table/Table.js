import { Box, Table as MuiTable, TableSortLabel, TextField, Toolbar, Typography } from '@mui/material';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableVirtuoso } from 'react-virtuoso';

import './Table.css'
import { useState } from 'react';
import React from 'react';
import { visuallyHidden } from '@mui/utils';

export default function Table({ observations, customAttributeKeys, selectedObjectId, setSelectedObjectId }) {
    const [search, setSearch] = useState("");
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('id');

    const columns = [
        {
            width: "2rem",
            label: 'Id',
            dataKey: 'id'
        },
        {
            width: "4rem",
            label: 'Type',
            dataKey: 'type'

        },
        {
            width: "4rem",
            label: 'Datetime',
            dataKey: 'datetime'
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
            id: id,
            type: geoObject.type,
            datetime: geoObject.dateTime,
        }

        Object.entries(geoObject.customAttributes).forEach(([key, value]) => {
            data[key] = value
        });

        return data;
    })).flat();

    
    const filteredRows = search !== "" ? rows.filter(row => {
        var result = false;
        Object.entries(row).forEach(([key, value]) => {
            if(value.toString().toLowerCase().includes(search.toLowerCase())) {
                result = true;
            }
        });
        return result;
    }) : rows;

    const VirtuosoTableComponents = {
        Scroller: React.forwardRef((props, ref) => (
            <TableContainer component={Paper} {...props} ref={ref} />
        )),
        Table: (props) => (
            <MuiTable {...props} stickyHeader size='small' sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />
        ),
        TableHead: React.forwardRef((props, ref) => <TableHead {...props} ref={ref} />),
        TableRow: React.forwardRef((props, ref) => <TableRow {...props} ref={ref} />),
        TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
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
                        sortDirection={orderBy === column.dataKey ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === column.dataKey}
                            direction={orderBy === column.dataKey ? order : 'asc'}
                            onClick={() => handleRequestSort(column.dataKey)}
                        >
                            <b>{column.label}</b>
                            {orderBy === column.dataKey ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
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
                >
                    {row[column.dataKey]}
                </TableCell>
            ));
    }

    const descendingComparator = (a, b, orderBy) => {
        if(b[orderBy] < a[orderBy]) {
            return -1;
        }
        if(b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }

    const getComparator = (order, orderBy) => {
        return order ==='desc' 
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    }

    const sortedRows = filteredRows.sort(getComparator(order, orderBy));

    return (
        <div className='table-container'>
            <Toolbar className='toolbar'>
                <Typography
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                >
                    <b>{sortedRows.length} Objects{selectedObjectId ? ` | Selected Object Id: ${selectedObjectId}` : ''}</b>
                </Typography>
                <TextField
                    className='search_bar'
                    key="search_input_field"
                    size="small"
                    placeholder="Search…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </Toolbar>
            <TableVirtuoso
                data={sortedRows}
                components={VirtuosoTableComponents}
                fixedHeaderContent={fixedHeaderContent}
                itemContent={rowContent}
            />
        </div>
    );
}