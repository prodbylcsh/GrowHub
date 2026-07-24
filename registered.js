const discordInvite = sessionStorage.getItem("discordInvite");

if (discordInvite) {
    const linkEl = document.querySelector("#discord-invite-link");
    linkEl.textContent = discordInvite;

    sessionStorage.removeItem("discordInvite");
}