"""
Standard VAPID Key Pair Generator for Web Push Notifications.
"""
import base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization

def generate():
    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()

    # Raw uncompressed public key bytes (65 bytes)
    public_bytes = public_key.public_bytes(
        encoding=serialization.Encoding.X962,
        format=serialization.PublicFormat.UncompressedPoint
    )
    public_key_b64 = base64.urlsafe_b64encode(public_bytes).decode('utf-8').rstrip('=')

    # PEM formatted private key
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    ).decode('utf-8').replace('\r\n', '\n')

    # Raw private key scalar (32 bytes base64url)
    priv_num = private_key.private_numbers().private_value
    priv_bytes = priv_num.to_bytes(32, byteorder='big')
    private_key_b64 = base64.urlsafe_b64encode(priv_bytes).decode('utf-8').rstrip('=')

    print("=" * 60)
    print("VAPID Keys Generated Successfully:")
    print("=" * 60)
    print(f"VAPID_PUBLIC_KEY={public_key_b64}")
    print(f"VAPID_PRIVATE_KEY={private_key_b64}")
    print("\nFrontend Key:")
    print(f"VITE_VAPID_PUBLIC_KEY={public_key_b64}")
    print("=" * 60)

    return public_key_b64, private_key_b64

if __name__ == "__main__":
    generate()
