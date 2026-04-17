'use client';

import { useState, useEffect } from 'react';

export default function TestHiddenPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/verify-marketplace-filter')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white text-xl">Loading verification...</div>
            </div>
        );
    }

    if (data?.error) {
        return (
            <div className="min-h-screen bg-slate-950 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-red-500 mb-4">Error</h1>
                    <pre className="bg-slate-900 p-4 rounded text-red-400">{JSON.stringify(data, null, 2)}</pre>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">🔍 Hidden NFTs Verification</h1>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                        <h2 className="text-sm text-slate-400 mb-2">Database Hidden NFTs</h2>
                        <p className="text-3xl font-bold text-blue-400">{data?.database?.total_hidden || 0}</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                        <h2 className="text-sm text-slate-400 mb-2">API Returns</h2>
                        <p className="text-3xl font-bold text-green-400">{data?.api_response?.hidden_nfts_count || 0}</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                        <h2 className="text-sm text-slate-400 mb-2">Status</h2>
                        <p className={`text-xl font-bold ${data?.verification?.database_matches_api ? 'text-green-400' : 'text-red-400'}`}>
                            {data?.verification?.database_matches_api ? '✅ Matched' : '❌ Mismatch'}
                        </p>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-xl mb-8">
                    <h2 className="text-lg font-bold text-blue-400 mb-2">📋 Verification Instructions</h2>
                    <p className="text-slate-300">{data?.verification?.instructions}</p>
                    <p className="text-slate-400 text-sm mt-2">
                        Go to Marketplace → Open Browser Console (F12) → Hidden NFTs will log: "NFT #X hidden by admin"
                    </p>
                </div>

                {/* Recent Hidden NFTs */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">🕐 Recently Hidden NFTs (Last 20)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {data?.database?.recent_hidden?.map((nft: any) => (
                            <div key={nft.nft_id} className="bg-slate-950 p-3 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-mono">NFT #{nft.nft_id}</span>
                                    <span className="text-xs text-slate-400">
                                        {new Date(nft.hidden_by_admin_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sample Hidden IDs */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <h2 className="text-xl font-bold text-white mb-4">📝 Sample Hidden NFT IDs (First 50)</h2>
                    <div className="bg-slate-950 p-4 rounded-lg">
                        <p className="text-slate-300 font-mono text-sm break-all">
                            {data?.database?.sample_ids?.join(', ')}
                        </p>
                    </div>
                    <p className="text-slate-500 text-sm mt-3">
                        Total: {data?.database?.all_hidden_ids_count} hidden NFTs
                    </p>
                </div>

                {/* Raw Data */}
                <details className="mt-8">
                    <summary className="text-white cursor-pointer hover:text-blue-400">Show Raw Data</summary>
                    <pre className="bg-slate-900 p-4 rounded mt-4 text-slate-300 text-xs overflow-auto">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </details>
            </div>
        </div>
    );
}
