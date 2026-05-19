
import React from "react";
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Paper,
    Tooltip,
} from "@mui/material";
import {
    getUniqueRoomNos,
    getMealRow,
} from "./chargesReportHelpers";
const borderStyle = "1px solid rgba(224,224,224,1)";

const ChargesReportTable = ({
    data,
    colors,
    setPopup, // ADD THIS
}) => {
    const roomNos =
        getUniqueRoomNos(data);

    const renderMealCells = (
        meal,
        itemList = []
    ) => {
        if (!itemList.length) {
            return (
                <TableCell
                    align="center"
                    sx={{
                        border:
                            borderStyle,
                    }}
                >
                    -
                </TableCell>
            );
        }

        return itemList.map(
            (item, idx) => {
                const itemKey =
                    item?.item_name || "";

                const qty =
                    meal?.data?.[
                        itemKey
                    ];

                const optionRaw =
                    meal?.option?.[
                        itemKey
                    ];

                let popupText =
                    "";

                let popupTitle =
                    "";

                let hasOption =
                    false;

                // real item name
                if (
                    item?.real_item_name
                ) {
                    popupTitle =
                        item.real_item_name;
                }

                // Handle option data
                if (
                    Array.isArray(
                        optionRaw
                    )
                ) {
                    const optionLines =
                        optionRaw
                            .map(
                                (
                                    opt
                                ) => {
                                    if (
                                        typeof opt ===
                                        "object"
                                    ) {
                                        return (
                                            opt.itemName ||
                                            opt.optionName ||
                                            ""
                                        );
                                    }

                                    return opt;
                                }
                            )
                            .filter(
                                Boolean
                            );

                    popupText =
                        optionLines.join(
                            "\n"
                        );

                    hasOption =
                        optionLines.length >
                        0;
                } else if (
                    typeof optionRaw ===
                    "string"
                ) {
                    popupText =
                        optionRaw;

                    hasOption =
                        optionRaw.trim()
                            .length > 0;
                }

                const showPopover =
                    idx >= 4 &&
                    qty >= 1 &&
                    hasOption;

                return (
                    <TableCell
                        key={idx}
                        align="center"
                        sx={{
                            border:
                                borderStyle,
                        }}
                    >
                        {qty ===
                            undefined ||
                        qty === null ? (
                            "-"
                        ) : showPopover ? (
                            <span
                                style={{
                                    color:
                                        "#1976d2",
                                    cursor:
                                        "pointer",
                                    textDecoration:
                                        "underline",
                                    fontWeight: 600,
                                }}
                                onClick={(
                                    e
                                ) => {
                                    e.stopPropagation();

                                    setPopup({
                                        open: true,
                                        anchorEl:
                                            e.currentTarget,
                                        text:
                                            popupText,
                                        title:
                                            popupTitle,
                                    });
                                }}
                            >
                                {qty}
                            </span>
                        ) : (
                            qty
                        )}
                    </TableCell>
                );
            }
        );
    };

    return (
        <TableContainer
            component={Paper}
            sx={{
                overflowX:"auto",
            }}
        >
            <Table
                sx={{
                    borderCollapse:"collapse",
                    minWidth: 900,
                }}
            >
                <TableHead>
                    {/* TOP HEADER */}
                    <TableRow
                        sx={{
                            backgroundColor:
                                colors.blueAccent[700],
                        }}
                    >
                        <TableCell
                            rowSpan={2}
                            align="center"
                            sx={{
                                border:borderStyle,                  
                            }}
                        >
                            #
                        </TableCell>

                        <TableCell
                            align="center"
                            colSpan={Math.max(
                                data?.breakfast_item_list
                                    ?.length ||
                                    1,
                                1
                            )}
                            sx={{
                                border:borderStyle,
                            }}
                        >
                            Breakfast
                        </TableCell>

                        <TableCell
                            align="center"
                            colSpan={Math.max(
                                data?.lunch_item_list
                                    ?.length ||
                                    1,
                                1
                            )}
                            sx={{
                                border:borderStyle,
                            }}
                        >
                            Lunch
                        </TableCell>

                        <TableCell
                            align="center"
                            colSpan={Math.max(
                                data?.dinner_item_list
                                    ?.length ||
                                    1,
                                1
                            )}
                            sx={{
                                border:borderStyle,                             
                            }}
                        >
                            Dinner
                        </TableCell>
                    </TableRow>

                    {/* ITEM HEADER */}
                    <TableRow
                        sx={{
                            backgroundColor:
                                colors.blueAccent[700],
                        }}
                    >
                        {[
                            ...(data?.breakfast_item_list ||
                                []),
                            ...(data?.lunch_item_list ||
                                []),
                            ...(data?.dinner_item_list ||
                                []),
                        ].map(
                            (
                                item,
                                idx
                            ) => (
                                <TableCell
                                    key={idx}
                                    align="center"
                                    sx={{
                                        border:
                                            borderStyle,                                    
                                        whiteSpace:
                                            "nowrap",
                                    }}
                                >
                                    <Tooltip
                                        arrow
                                        title={
                                            item.real_item_name ||
                                            item.item_name
                                        }
                                    >
                                        <span>
                                            {
                                                item.item_name
                                            }
                                        </span>
                                    </Tooltip>
                                </TableCell>
                            )
                        )}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {/* NO REPORT */}
                    {!roomNos.length ? (
                        <TableRow>
                            <TableCell
                                colSpan={
                                    1 +
                                    (data?.breakfast_item_list
                                        ?.length ||
                                        0) +
                                    (data?.lunch_item_list
                                        ?.length ||
                                        0) +
                                    (data?.dinner_item_list
                                        ?.length ||
                                        0)
                                }
                                align="center"
                                sx={{
                                    border:
                                        borderStyle,
                                    py: 5,
                                    fontWeight: 700,
                                    fontSize: 18,
                                    textAlign: "center",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                No Report Found. dasd
                            </TableCell>
                        </TableRow>
                    ) : (
                        roomNos.map(
                            (
                                roomNo,
                                idx
                            ) => {
                                const breakfast =
                                    getMealRow(
                                        data?.report_breakfast_list,
                                        roomNo
                                    );

                                const lunch =
                                    getMealRow(
                                        data?.report_lunch_list,
                                        roomNo
                                    );

                                const dinner =
                                    getMealRow(
                                        data?.report_dinner_list,
                                        roomNo
                                    );

                                return (
                                    <TableRow
                                        key={
                                            idx
                                        }
                                    >
                                        <TableCell
                                            align="center"
                                            sx={{
                                                border:
                                                    borderStyle,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {
                                                roomNo
                                            }
                                        </TableCell>

                                        {renderMealCells(
                                            breakfast,
                                            data?.breakfast_item_list
                                        )}

                                        {renderMealCells(
                                            lunch,
                                            data?.lunch_item_list
                                        )}

                                        {renderMealCells(
                                            dinner,
                                            data?.dinner_item_list
                                        )}
                                    </TableRow>
                                );
                            }
                        )
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ChargesReportTable;
