const discordInvite = sessionStorage.getItem("discordInvite");

if (discordInvite) {
    const linkEl = document.querySelector("#discord-invite-link");
    linkEl.href = discordInvite;
    linkEl.textContent = discordInvite;

    sessionStorage.removeItem("discordInvite");
}