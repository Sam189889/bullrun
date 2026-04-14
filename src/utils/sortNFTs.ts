type PinnedNFT = { nft_id: number; pin_order: number };

export function sortWithPinned(nftIds: number[], pinnedNFTs: PinnedNFT[]): number[] {
    const pinned = pinnedNFTs
        .filter(p => nftIds.includes(p.nft_id))
        .sort((a, b) => a.pin_order - b.pin_order)
        .map(p => p.nft_id);
    
    const regular = nftIds.filter(id => !pinned.includes(id));
    
    return [...pinned, ...regular];
}
