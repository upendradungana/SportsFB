// Fixes UND_ERR_CONNECT_TIMEOUT where IPv6 resolves but is unreachable (common on Windows/campus networks).
import dns from "dns";
import net from "net";
dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamilyAttemptTimeout?.(1000);
