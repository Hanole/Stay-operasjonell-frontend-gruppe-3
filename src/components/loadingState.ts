// Ole-Magnus Stallvik | Hanole

export function renderRoomCardSkeleton(amount: number): HTMLDivElement[] {
    const skeletons: HTMLDivElement[] = [];

    for (let i = 0; i < amount; i++) {
        const card = document.createElement("div");
        card.className = "explore-room-card skeleton";
        card.innerHTML = `
            <div class="skeleton-box"></div>

            <div class="explore-card-details">
                <div class="explore-card-bio">
                    <div class="skeleton-line skeleton-title"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line skeleton-short"></div>

                    <div class="explore-card-features">
                        <div class="skeleton-pill"></div>
                        <div class="skeleton-pill"></div>
                        <div class="skeleton-pill"></div>
                    </div>
                </div>

                <div class="explore-card-price">
                    <div class="explore-card-price-info">
                        <div class="skeleton-line skeleton-price"></div>
                        <div class="skeleton-line skeleton-short"></div>
                    </div> 

                    <div class="skeleton-circle"></div>        
                </div>
            </div>
            `;
            skeletons.push(card);
    }

    return skeletons;
}