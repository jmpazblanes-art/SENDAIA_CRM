
"use client"


export function CalComEmbed({ bookingUrl }: { bookingUrl: string }) {
    // Extract username/event from URL
    const urlParts = bookingUrl.replace("https://cal.com/", "").split("/")
    const calLink = urlParts.join("/")

    return (
        <div className="w-full h-[600px] bg-card rounded-xl border border-border overflow-hidden">
            <iframe
                src={`https://cal.com/${calLink}?embed=true`}
                width="100%"
                height="100%"
                frameBorder="0"
                title="Cal.com Booking"
            />
        </div>
    )
}
