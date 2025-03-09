import matplotlib.pyplot as plt

def draw_flowchart():
    fig, ax = plt.subplots()
    ax.axis('off')  # Hide the default axes

    # Define positions for each step (x, y)
    steps = {
        "step1": (0.5, 0.9),
        "step2": (0.5, 0.75),
        "step3": (0.5, 0.60),
        "step4": (0.5, 0.45),
        "step5": (0.5, 0.30),
        "step6": (0.5, 0.15),
    }

    # Text for each step
    text_map = {
        "step1": "1. User visits /login in Next.js",
        "step2": "2. Next.js calls Supabase Auth (signInWithPassword)",
        "step3": "3. Supabase returns session/JWT token to Next.js",
        "step4": "4. Next.js calls Spring Boot endpoint with token",
        "step5": "5. Spring Boot validates token (Supabase JWKS)",
        "step6": "6. Spring Boot returns secure data"
    }

    # Draw text boxes for each step
    for key, pos in steps.items():
        ax.text(
            pos[0],
            pos[1],
            text_map[key],
            ha='center',
            va='center',
            bbox=dict(boxstyle='round')  # Rounded box
        )

    # Draw arrows between steps
    step_keys = list(steps.keys())
    for i in range(len(step_keys) - 1):
        start = step_keys[i]
        end = step_keys[i + 1]
        start_pos = steps[start]
        end_pos = steps[end]
        ax.annotate(
            '',
            xy=end_pos,
            xytext=start_pos,
            arrowprops=dict(arrowstyle='->')
        )

    plt.show()

draw_flowchart()
