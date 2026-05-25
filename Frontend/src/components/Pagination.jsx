import React from 'react';
import datas from '../utils/CommonData';

const Pagination = ({ page, doSearch, changePageSize, hideGoToPage = false }) => {
    const [rowPerPage, setRowPerPage] = React.useState(page.pageSize || 10);
    const [goToPage, setGoToPage] = React.useState(page.pageNo || 1);

    const totalPages = Number(page.totalPages || 0);
    const pageNo = Number(page.pageNo || 1);

    React.useEffect(() => {
        setGoToPage(pageNo);
    }, [pageNo]);

    const computeWindow = React.useCallback(() => {
        if (totalPages <= 0) return [];
        if (pageNo === 1) return [1, 2, 3, 4, 5].filter((p) => p <= totalPages);
        if (pageNo === 2) return [1, 2, 3, 4, 5].filter((p) => p <= totalPages);
        if (pageNo === totalPages)
            return [pageNo - 4, pageNo - 3, pageNo - 2, pageNo - 1, pageNo].filter((p) => p >= 1);
        if (pageNo === totalPages - 1)
            return [pageNo - 3, pageNo - 2, pageNo - 1, pageNo, pageNo + 1].filter(
                (p) => p >= 1 && p <= totalPages,
            );
        return [pageNo - 2, pageNo - 1, pageNo, pageNo + 1, pageNo + 2].filter(
            (p) => p >= 1 && p <= totalPages,
        );
    }, [pageNo, totalPages]);

    const pages = computeWindow();

    const onChangeRowPerPage = async (e) => {
        const value = Number(e.target.value);
        setRowPerPage(value);
        const firstRowInPage = (pageNo - 1) * page.pageSize + 1;
        const targetPageZeroIndexed = Math.floor((firstRowInPage - 1) / value);
        if (changePageSize) {
           await changePageSize(value, targetPageZeroIndexed);
        }
        doSearch(targetPageZeroIndexed + 1, value);
    };

    const onGoToPage = (e) => {
        const val = String(e.target.value || '').replace(/[^\d]/g, '');
        setGoToPage(val);
        if (val) doSearch(Number(val), rowPerPage);
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
                <label htmlFor="rowperpage" className="text-xs text-surface-400">
                    Row per page
                </label>
                <select
                    id="rowperpage"
                    value={rowPerPage}
                    onChange={onChangeRowPerPage}
                    className="bg-surface-800 border border-white/[0.06] text-white text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                    {datas.optionsRowPerPage.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-4">
                {!hideGoToPage && totalPages > 0 && (
                    <div className="flex items-center gap-2">
                        <label htmlFor="gotopage" className="text-xs text-surface-400">
                            Go to page
                        </label>
                        <input
                            id="gotopage"
                            type="number"
                            placeholder="..."
                            value={goToPage}
                            onInput={onGoToPage}
                            min={1}
                            max={totalPages}
                            className="bg-surface-800 border border-white/[0.06] text-white text-xs rounded px-2 py-1 w-16 text-center focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                    </div>
                )}

                {totalPages > 0 && (
                    <div className="flex items-center gap-1">
                        <button
                            disabled={pageNo <= 1}
                            onClick={() => doSearch(1, rowPerPage)}
                            className="p-1 rounded text-surface-400 hover:text-white hover:bg-white/[0.04] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &laquo;
                        </button>
                        <button
                            disabled={pageNo <= 1}
                            onClick={() => doSearch(pageNo - 1, rowPerPage)}
                            className="p-1 rounded text-surface-400 hover:text-white hover:bg-white/[0.04] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &lt;
                        </button>
                        
                        <div className="flex gap-1">
                            {pages.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => doSearch(p, rowPerPage)}
                                    className={`w-7 h-7 rounded text-xs flex items-center justify-center transition-all ${
                                        p === pageNo
                                            ? 'bg-brand-500 text-white font-medium'
                                            : 'text-surface-400 hover:text-white hover:bg-white/[0.04]'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={pageNo >= totalPages}
                            onClick={() => doSearch(pageNo + 1, rowPerPage)}
                            className="p-1 rounded text-surface-400 hover:text-white hover:bg-white/[0.04] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &gt;
                        </button>
                        <button
                            disabled={pageNo >= totalPages}
                            onClick={() => doSearch(totalPages, rowPerPage)}
                            className="p-1 rounded text-surface-400 hover:text-white hover:bg-white/[0.04] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &raquo;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pagination;
