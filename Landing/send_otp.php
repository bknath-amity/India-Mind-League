<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

// ------------------------------------------------------------------
// DEBUG MODE — set to false once live delivery is confirmed working.
// ------------------------------------------------------------------
define('OTP_DEBUG', true);
define('OTP_LOG_FILE', __DIR__ . '/otp_debug.log');

function otp_log($label, $data) {
    if (!OTP_DEBUG) return;
    $line = '[' . date('Y-m-d H:i:s') . "] $label: " . (is_string($data) ? $data : json_encode($data)) . "\n";
    @file_put_contents(OTP_LOG_FILE, $line, FILE_APPEND);
}

require_once 'config.php';

// ------------------------------------------------------------------
// HTTP POST helper — uses curl_exec() if it's actually available,
// otherwise falls back to file_get_contents() with a stream context.
// curl_exec() is disabled on this live host (confirmed via diagnostic:
// errno 0 / no error / 0s elapsed / empty response on every curl call),
// so this will use the stream-context path here, which IS working
// (proven by the outbound IP check succeeding via file_get_contents).
// ------------------------------------------------------------------
function http_post($url, array $postData, $timeoutSeconds = 20) {
    $result = ['ok' => false, 'http_code' => 0, 'body' => '', 'error' => ''];

    $curlAvailable = function_exists('curl_exec')
        && !in_array('curl_exec', array_map('trim', explode(',', (string) ini_get('disable_functions'))));

    if ($curlAvailable) {
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT        => $timeoutSeconds,
            CURLOPT_CUSTOMREQUEST  => "POST",
            CURLOPT_POSTFIELDS     => http_build_query($postData),
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);
        $response = curl_exec($curl);
        $err      = curl_error($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        if ($response !== false && !$err && $httpCode > 0) {
            $result['ok'] = true;
            $result['http_code'] = $httpCode;
            $result['body'] = $response;
            return $result;
        }
        $result['error'] = 'curl attempt failed (errno-less): ' . $err;
    }

    // ---- file_get_contents / stream context fallback ----
    $body = http_build_query($postData);
    $context = stream_context_create([
        'http' => [
            'method'  => 'POST',
            'header'  => "Content-Type: application/x-www-form-urlencoded\r\n" .
                         "Content-Length: " . strlen($body) . "\r\n",
            'content' => $body,
            'timeout' => $timeoutSeconds,
            'ignore_errors' => true,
        ],
        'ssl' => [
            'verify_peer'      => true,
            'verify_peer_name' => true,
        ],
    ]);

    $response = @file_get_contents($url, false, $context);

    $httpCode = 0;
    if (isset($http_response_header) && is_array($http_response_header)) {
        foreach ($http_response_header as $header) {
            if (preg_match('#^HTTP/\S+\s+(\d+)#', $header, $m)) {
                $httpCode = (int) $m[1];
                break;
            }
        }
    }

    if ($response === false) {
        $err = error_get_last();
        $result['error'] = 'file_get_contents failed: ' . ($err['message'] ?? 'unknown error');
        return $result;
    }

    $result['ok'] = true;
    $result['http_code'] = $httpCode;
    $result['body'] = $response;
    return $result;
}

// ------------------------------------------------------------------
// EMAIL FUNCTION (Falconide API, falls back to mail())
// ------------------------------------------------------------------
function sendemail($email, $message) {
    $postData = [
        'api_key'    => '097e73fad0d10b8d0a41a82885efa676',
        'subject'    => 'Welcome onboard!',
        'fromname'   => 'Amity Schools Alumni Club',
        'from'       => 'noreply@amity.in',
        'recipients' => $email,
        'content'    => $message,
    ];

    $res = http_post("https://app2in.falconide.com/falconapi/web.send.rest", $postData);

    otp_log('EMAIL http_code', $res['http_code']);
    otp_log('EMAIL error', $res['error'] ?: '(none)');
    otp_log('EMAIL response', $res['body'] ?: '(empty)');

    $apiOk = $res['ok'] && $res['http_code'] >= 200 && $res['http_code'] < 300
             && stripos($res['body'], '"status":"error"') === false;

    if (!$apiOk) {
        otp_log('EMAIL', 'Falling back to PHP mail() for ' . $email);
        $headers  = "From: noreply@amity.in\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $mailOk = @mail($email, "Your OTP for India Mind League", $message, $headers);
        otp_log('EMAIL mail() result', $mailOk ? 'accepted by server (check spam folder too)' : 'mail() returned false');
    }
}

// ------------------------------------------------------------------
// SMS FUNCTION (ConnectExpress API)
// ------------------------------------------------------------------
function sendmobileotp($mobile, $otp) {
    $message = "Use " . $otp . " as one time password (OTP) to login to https://dvs.amizone.net/index.php?r=site%2Flogin. Do not share this OTP with anyone for security reasons. - Amity Noida";

    $postData = [
        'api_key' => 'A60dc1768d5b3be0a6aeb03646dab346d',
        'method'  => 'sms',
        'sender'  => 'AMITY',
        'to'      => $mobile,
        'message' => $message,
    ];

    $res = http_post("https://connectexpress.in/api/v3/", $postData);

    otp_log('SMS http_code', $res['http_code']);
    otp_log('SMS error', $res['error'] ?: '(none)');
    otp_log('SMS response', $res['body'] ?: '(empty)');
}

// ------------------------------------------------------------------
// MAIN OTP LOGIC
// ------------------------------------------------------------------
try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method.');
    }

    $contact     = trim($_POST['contact'] ?? '');
    $contactType = trim($_POST['contact_type'] ?? '');

    if (empty($contact) || empty($contactType)) {
        throw new Exception('Contact is required.');
    }

    if (!in_array($contactType, ['email', 'phone'])) {
        throw new Exception('Invalid contact type.');
    }

    if ($contactType === 'email') {
        if (!filter_var($contact, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email address.');
        }
    } else {
        if (!preg_match('/^[6-9][0-9]{9}$/', $contact)) {
            throw new Exception('Invalid mobile number.');
        }
    }

    $field = ($contactType === 'email') ? 'email' : 'mobile_number';
    $check = $conn->prepare("SELECT id FROM registrations WHERE $field = ?");
    if (!$check) {
        throw new Exception('Database prepare failed: ' . $conn->error);
    }
    $check->bind_param("s", $contact);
    $check->execute();
    $check->store_result();

    if ($check->num_rows === 0) {
        throw new Exception('This account is not registered.');
    }
    $check->bind_result($registrationId);
    $check->fetch();
    $check->close();

    $delete = $conn->prepare("DELETE FROM login_otp WHERE registration_id = ?");
    if (!$delete) {
        throw new Exception('Database prepare (delete) failed: ' . $conn->error);
    }
    $delete->bind_param("i", $registrationId);
    $delete->execute();
    $delete->close();

    $otp     = str_pad(rand(0, 999999), 6, "0", STR_PAD_LEFT);
    $expires = date("Y-m-d H:i:s", strtotime("+5 minutes"));

    $insert = $conn->prepare("
        INSERT INTO login_otp (registration_id, contact, contact_type, otp, expires_at)
        VALUES (?, ?, ?, ?, ?)
    ");
    if (!$insert) {
        throw new Exception('Database prepare (insert) failed: ' . $conn->error);
    }
    $insert->bind_param("issss", $registrationId, $contact, $contactType, $otp, $expires);

    if (!$insert->execute()) {
        throw new Exception('Failed to save OTP: ' . $insert->error);
    }
    $insert->close();

    otp_log('OTP generated', "contact=$contact type=$contactType otp=$otp");

    if ($contactType === 'email') {
        $emailMessage = "Your OTP for India Mind League is: <b>$otp</b>. It is valid for 5 minutes.";
        sendemail($contact, $emailMessage);
    } else {
        $phone = (substr($contact, 0, 2) === '91') ? $contact : '91' . $contact;
        sendmobileotp($phone, $otp);
    }

    $responsePayload = [
        "status"  => "success",
        "message" => "OTP sent successfully.",
        "contact" => $contact
    ];

    if (OTP_DEBUG) {
        $responsePayload['otp'] = $otp;
    }

    echo json_encode($responsePayload);

} catch (Exception $e) {
    otp_log('ERROR', $e->getMessage());
    echo json_encode([
        "status"  => "error",
        "message" => $e->getMessage()
    ]);
} finally {
    if (isset($conn) && $conn) $conn->close();
}
?>