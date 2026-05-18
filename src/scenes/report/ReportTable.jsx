// ReportTable.jsx

import React from "react";

import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";

import {
    getColumnKeys,
    getCellValue,
    getRoomName,
} from "./reportHelpers";

const ReportTable = ({
    colors,
    data,
    rowsArray,
    getColumns,
}) => {
    const columnKeys =
        getColumnKeys(data);

    return (
        <Box
            sx={{
                overflowX: "auto",
                width: "100%",
            }}
        >
            <TableContainer
                component={Paper}
            >
                <Table
                    sx={{
                        border:
                            "1px solid rgba(224,224,224,1)",
                        borderCollapse:
                            "collapse",
                        minWidth: 650,
                    }}
                >
                    <TableHead>
                        {/* Top Header */}
                        <TableRow
                            sx={{
                                backgroundColor:
                                    colors
                                        .blueAccent[700],
                            }}
                        >
                            {getColumns(0).map(
                                (
                                    item,
                                    index
                                ) => (
                                    <TableCell
                                        key={
                                            index
                                        }
                                        align="center"
                                        sx={{
                                            border:
                                                "1px solid rgba(224,224,224,1)",
                                            whiteSpace:
                                                "nowrap",
                                            
                                        }}
                                        {...(index ===
                                        0
                                            ? {
                                                  rowSpan:
                                                      item?.rowspan,
                                              }
                                            : {
                                                  colSpan:
                                                      item?.colspan,
                                              })}
                                    >
                                        {
                                            item?.title
                                        }
                                    </TableCell>
                                )
                            )}
                        </TableRow>

                        {/* Middle Header */}
                        <TableRow
                            sx={{
                                backgroundColor:
                                    colors
                                        .blueAccent[700],
                            }}
                        >
                            {getColumns(
                                data?.columns
                                    ?.length - 2
                            ).map(
                                (
                                    item,
                                    key
                                ) => (
                                    <TableCell
                                        key={
                                            key
                                        }
                                        align="center"
                                        sx={{
                                            border:
                                                "1px solid rgba(224,224,224,1)",
                                            whiteSpace:
                                                "nowrap",
                                           
                                        }}
                                    >
                                        {
                                            item.title
                                        }
                                    </TableCell>
                                )
                            )}
                        </TableRow>

                        {/* BA B1 LA etc */}
                        <TableRow
                            sx={{
                                backgroundColor:
                                    colors
                                        .blueAccent[700],
                            }}
                        >
                            {columnKeys.map(
                                (
                                    key,
                                    index
                                ) => (
                                    <TableCell
                                        key={
                                            index
                                        }
                                        align="center"
                                        sx={{
                                            border:
                                                "1px solid rgba(224,224,224,1)",
                                            whiteSpace:
                                                "nowrap",                                    
                                        }}
                                    >
                                        {key}
                                    </TableCell>
                                )
                            )}
                        </TableRow>

                        {/* Total Row */}
                        <TableRow>
                            <TableCell
                                align="center"
                                sx={{
                                    border:
                                        "1px solid rgba(224,224,224,1)",
                                    fontWeight: "bold",
                                    backgroundColor:
                                        colors
                                            .primary[400],
                                    whiteSpace:
                                        "nowrap",
                                }}
                            />

                            {columnKeys.map(
                                (
                                    key,
                                    index
                                ) => (
                                    <TableCell
                                        key={
                                            index
                                        }
                                        align="center"
                                        sx={{
                                            border:
                                                "1px solid rgba(224,224,224,1)",
                                            fontWeight:
                                                "bold",
                                            backgroundColor:
                                                colors
                                                    .primary[400],
                                            color:
                                                colors
                                                    .redAccent[800],
                                            whiteSpace:
                                                "nowrap",
                                        }}
                                    >
                                        {data
                                            ?.total?.[
                                            key
                                        ] !==
                                        undefined
                                            ? data
                                                  .total[
                                                  key
                                              ]
                                            : ""}
                                    </TableCell>
                                )
                            )}
                        </TableRow>
                    </TableHead>

                    {/* Body */}
                    <TableBody>
                        {rowsArray.map(
                            (
                                room,
                                index
                            ) => (
                                <TableRow
                                    key={index}
                                >
                                    <TableCell
                                        align="center"
                                        sx={{
                                            border:
                                                "1px solid rgba(224,224,224,1)",
                                            whiteSpace:
                                                "nowrap",
                                        }}
                                    >
                                        {getRoomName(
                                            room
                                        )}
                                    </TableCell>

                                    {columnKeys.map(
                                        (
                                            key,
                                            subIndex
                                        ) => (
                                            <TableCell
                                                key={
                                                    subIndex
                                                }
                                                align="center"
                                                sx={{
                                                    border:
                                                        "1px solid rgba(224,224,224,1)",
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                {getCellValue(
                                                    room,
                                                    key
                                                )}
                                            </TableCell>
                                        )
                                    )}
                                </TableRow>
                            )
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ReportTable;
